import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { featureState } from '../../../App';
import { useState } from '@hookstate/core';
import { capitalize, domainParser } from '../../../functions';
import {
  Select,
  Chip,
  MenuItem,
  ListItemText,
  Input
} from '@material-ui/core';
import { deepElement } from '../ItemList';

const useStyles = makeStyles(() => ({
  container: {
    flex: '0 1 80%'
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  chip: {
    margin: 2,
    backgroundColor: '#00ACAE'
  },
}));
const ITEM_HEIGHT = 25;
const ITEM_PADDING_TOP = 0;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      maxWidth: '100 !important',
      backgroundColor: '#00ACAE'
    }
  }
};

interface MenuItemData {
  name: string;
  icon?: string;
}
const StyledFilterMenuItem = withStyles(theme => ({
  root: {
    '&:focus': { 
      backgroundColor: theme.palette.primary.main,
    },
    display: 'flex',
    gap: '5%',
    height: ITEM_HEIGHT
  }
}))(MenuItem);

export interface ValueFilterProps {
  filterName: string;
  filterIdx: number;
}
export const ValueFilter: React.FC<ValueFilterProps> = ({
  filterName,
  filterIdx
}: ValueFilterProps) => {
  const state = useState(featureState);
  const styles = useStyles();
  
  const filterChoices = React.useMemo(
    () => {
      const parser: (str: string) => string = 
        filterName === 'url' 
        ? domainParser 
        : (x: string) => x;
      const data: MenuItemData[] = state.results.get().map(item => 
        filterName === 'url'
        ? { name: parser(deepElement(filterName, item)), icon: item?.logo?.src }
        : { name: parser(deepElement(filterName, item)) }
      );
      const uniques = [...new Set(data)];
      const sorted = uniques.sort((a,b) => a.name.localeCompare(b.name));
      return sorted;
    }, [state.results]);

  const onOptionChange = (
    e: React.ChangeEvent<{ value: unknown }>
  ): void => 
    state.features[filterIdx].filter.values
      .set(p => [...(p as string[]), e.target.value as string]);
  const onOptionDelete = (
    val: string
  ) => (): void => 
    state.features[filterIdx].filter.values.set(p => p?.filter(value => value !== val));

  return (
  <Select
    multiple
    labelId={`${filterName}-filter-label`}
    id={`${filterName}-filter`}
    value={state.features[filterIdx].filter.values.get()}
    onChange={onOptionChange}
    input={<Input id={`select-${filterName}-filter`}/>}
    className={styles.container}
    data-testid="ValueFilter"
    MenuProps={MenuProps}
    renderValue={sel => (
      <div className={styles.chips}>
        {(sel as string[]).map((val: unknown, i: number) => (
        <Chip
          key={i} 
          label={capitalize(val as string)}
          component="div"
          icon={<img src={`https://${val as string}.com/favicon.ico`} alt={val as string} width={24} height={24} />} 
          onDelete={onOptionDelete(val as string)}
          onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} 
          className={styles.chip} />
        ))}
      </div>
    )}
    >
    {filterChoices.map((choice, i) => (
    <StyledFilterMenuItem key={i} value={choice.name}>
      {choice.icon && (
      <img src={choice.icon} alt={choice.name} width={16} height={16} />
      )}
      <ListItemText primary={capitalize(choice.name)} />
    </StyledFilterMenuItem>
    ))}
  </Select>);
};