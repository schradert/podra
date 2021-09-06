import React from 'react';
import { Item, ItemProps } from '../';
import { firstBy } from 'thenby';
import { domainParser } from '../../../functions';
import { makeStyles } from '@material-ui/core/styles';
import { ItemLogoProps, ItemWordsProps } from '../../atoms';

const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
    height: '70%',
    maxHeight: '70%',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  }
}));
type SortOrder = 'asc' | 'desc' | -1 | 1;
export interface FilterType {
  name: string;
  values?: string[];
  keywords?: string[];
  range?: [string, string];
}
export interface SorterType {
  name: string;
  direction: SortOrder;
}
export interface ItemListProps {
  list?: ItemProps[];
  filters?: FilterType[];
  sort?: SorterType[];
}

/**
 * Recursive key listing of a deeply nested object with `.`-concatenation
 *
 * @param obj - The object with keys to be flattened
 * @param pre - The running list of nested keys
 * @returns The running list of keys (`pre`) or, once at the deepest level, 
 * the keys concatenated by `.`
 */
const deepKeys = (
  obj: ItemProps | ItemLogoProps | ItemWordsProps, 
  pre: string[] = []
): string | string[] =>
  Object(obj) === obj 
  ? Object.entries(obj).flatMap(([k, v]) => deepKeys(v, [...pre, k])) 
  : pre.join('.');

/**
 * Returns a value from a deeply nested object given a list of nested keys
 * 
 * @param fields - The list of nested keys used to get an element from `obj`
 * @param obj - The object from which an element will be returned
 * @returns The element of `obj` specified by the field path `fields`
 */
export const deepElement = (
  fields: string, 
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
  obj: any
): any => 
/* eslint-enable @typescript-eslint/no-explicit-any */
/* eslint-enable @typescript-eslint/explicit-module-boundary-types */
  fields.split('.').reduce((res, field) => res[field], obj);

/**
 * String sorting helper function that determines whether a string lies within 
 * a range specified by two strings.
 * 
 * @param range - The first and last value to compare `value` to
 * @param value - The value being considered inside or outside the range
 * @returns Whether `value` is within `range` or not
 */
const inRange = (
  range: [string, string], 
  value: string
): boolean => {
  const val: string = 
    value === 'today' 
    ? (new Date()).toLocaleDateString() 
    : value;
  const isAfterStart: boolean = 
    range[0] !== '-' 
    ? val.localeCompare(range[0]) >= 0 
    : true;
  const isBeforeEnd: boolean = 
    range[1] !== '-' 
    ? val.localeCompare(range[1]) <= 0 
    : true;
  return isAfterStart && isBeforeEnd;
};

/**
 * Filters a list of items by range or value selectors on specified nested 
 * features.
 * 
 * @param list - The list of items to be filtered
 * @param filters - The list of features and requirements to filter `list` on
 * @returns The filtered `list` by `filters` options
 */
const filterList = (
  list: ItemProps[], 
  filters: FilterType[]
): ItemProps[] => 
  filters.reduce(
    (result, filter) => {
      const parser: (str: string) => string = 
        filter.name === 'url' 
        ? domainParser 
        : (x: string) => x;
      return result.filter(item => {
        const fields: string = 
          (deepKeys(item, []) as string[])
            .filter(key => key.includes(filter.name))[0];
        const value: string = deepElement(fields, item);
        const range: [string, string] = filter.range ?? ['',''];
        return filter.values?.includes(parser(value)) 
            ?? (filter.keywords?.some(value.includes)
            ?? inRange(range, value));
      });},
    list
  );

/**
 * Sorts a list of items by nested features and in a specified orientation 
 * in the order parameterized.
 * 
 * @param list - The list of items being sorted through
 * @param sort - The list of sorting options to sort `list` by
 * @returns The sorted `list` by `sort` options
 */
const sortList = (
  list: ItemProps[], 
  sort: SorterType[]
): ItemProps[] => {
  const first = firstBy(
    r => deepElement(sort[0].name, r), 
    {direction: sort[0].direction});
  if (sort.length === 1) return list.sort(first);
  const sorters = sort.slice(1).reduce(
    (composition, sorter) => composition.thenBy(
      r => deepElement(sorter.name, r), 
      {direction: sorter.direction}), 
    first);
  return list.sort(sorters);
};

export const ItemList: React.FC<ItemListProps> = ({ 
  list = [], 
  filters, 
  sort 
}: ItemListProps) => {
  const styles = useStyles();
  const filteredList: ItemProps[] = filters ? filterList(list, filters) : list;
  const sortedList: ItemProps[] = 
    sort 
    ? sortList(filteredList, sort) 
    : filteredList;
  return (
  <div 
    className={styles.container} 
    data-testid="ItemList" >
    {sortedList.map(item => (
    <Item key={item.url} {...item}/>
    ))}
  </div>);
};