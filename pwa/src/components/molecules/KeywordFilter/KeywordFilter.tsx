import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ListSubheader, TextField } from '@material-ui/core';
import { 
  Autocomplete, 
  AutocompleteRenderGroupParams, 
  AutocompleteRenderOptionState,
  createFilterOptions
} from '@material-ui/lab';
import { featureState } from '../../../App';
import { useState } from '@hookstate/core';
import { deepElement } from '..';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import _ from 'lodash';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';

const commonWords = [
  'i','a','about','an','and','are','as','at','be','by','for','from','how','in',
  'is','it','of','on','or','that','the','this','to','was','what','when','where',
  'who','will','with','the','www'];

const useStyles = makeStyles(() => ({
  container: {
    flex: '0 1 80%'
  },
  filterLabel: {
    margin: 0, 
    top: 5, 
    marginTop: 7, 
    flex: '0 1 10%'
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

type Option = [string, number];
const Option = (
  option: Option,
  { inputValue }: AutocompleteRenderOptionState
): JSX.Element => {
  const matches = match(option[0], inputValue);
  const parts = parse(option[0], matches);
  return (
  <div>
    {parts.map((part, i) => (
    <span key={i} style={{ fontWeight: part.highlight ? 700 : 400 }}>
      {part.text}
    </span>
    ))}
    <span>{option[1]}</span>
  </div>);
};
const renderGroup = (
  params: AutocompleteRenderGroupParams
) => [
  <ListSubheader key={params.key} component="div">
    {params.group}
  </ListSubheader>,
  params.children
];
const LISTBOX_PADDING = 8;
const renderRow = ({
  data,
  index,
  style
}: ListChildComponentProps) => {
  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: (style.top as number) + LISTBOX_PADDING
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useResetCache = (data: any) => {
  const ref = React.useRef<VariableSizeList>(null);
  React.useEffect(() => {
    ref.current && ref.current.resetAfterIndex(0, true);
  }, [data]);
  return ref;
};


const Listbox = React.forwardRef<HTMLDivElement>((
  { children }: React.PropsWithChildren<unknown>, 
  ref
) => {
  const itemData = React.Children.toArray(children);
  const itemCount = itemData.length;
  const gridRef = useResetCache(itemCount);
  const itemSize = 48;
  
  const getChildSize = (
    // differentiates sizing if ListSubheader or other div
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: React.ReactNode
  ): number => itemSize;
  
  const height = 
    itemCount > 8
    ? 8 * itemSize
    : itemData.map(getChildSize).reduce((a,b) => a+b);

  return (
  <div ref={ref}>
    <VariableSizeList
      itemData={itemData}
      itemCount={itemCount}
      ref={gridRef}

      itemSize={index => getChildSize(itemData[index])}
      width="100%"
      height={height + 2*LISTBOX_PADDING}
      overscanCount={5}
    >
      {renderRow}
    </VariableSizeList>
  </div>)
});
Listbox.displayName = 'Listbox';

const filter = createFilterOptions<Option>({
  trim: true,
  stringify: option => option[0]
});

export interface KeywordFilterProps {
  filterName: string;
  filterIdx: number;
}
export const KeywordFilter: React.FC<KeywordFilterProps> = ({
  filterName,
  filterIdx,
}: KeywordFilterProps) => {
  const state = useState(featureState);
  const styles = useStyles();

  const options: Option[] = React.useMemo(
    () => {
      const text: string = state.results.reduce(
        (all, one) => all.concat(
          ' ', deepElement(filterName, one.get()).toLowerCase()), 
        '');
      const allWords: string[] = text.replace(/[^\w\d ]/g, '').split(' ');
      const words = allWords.filter(word => !commonWords.includes(word));
      return _
        .chain(words)
        .countBy()
        .sortBy()
        .toPairs().value();
    }, [state.results]);

  const handleKeywordChange = (
    _: React.ChangeEvent<unknown>,
    value: Option[]
  ): void => {
    const vals = value.map(val => 
      val[1] === -1 
      ? val[0].split(':')[1] 
      : val[0]);
    state.features[filterIdx].filter.keywords.set(vals);
  };

  const value = 
    state.features[filterIdx]
      .filter.values.get()?.map(word => [word, 0] as Option);

  return (
  <Autocomplete
    multiple
    filterSelectedOptions
    disableListWrap
    limitTags={25}

    id={`${filterName}-filter`}
    data-testid="KeywordFilter"
    className={styles.container}

    value={value}
    onChange={handleKeywordChange}

    options={options}
    renderOption={Option}
    filterOptions={(options, params) => {
      const filtered = filter(options, params);
      if (params.inputValue !== '') {
        filtered.push([`Add: "${params.inputValue}"`, -1])
      }
      return filtered;
    }}
    
    ListboxComponent={
      Listbox as React.ComponentType<React.HTMLAttributes<HTMLElement>>
    }
    renderInput={params => (
      <TextField 
        {...params} 
        variant="outlined" 
        placeholder="Keywords..."
        label={filterName} 
        margin="normal" />
    )}
    
    renderGroup={renderGroup}
    groupBy={option => {
      const rounded = Math.round(option[1] / 10) * 10;
      return `${rounded}-${rounded+10}`;
    }}

    selectOnFocus
    clearOnBlur
    handleHomeEndKeys
  />);
};