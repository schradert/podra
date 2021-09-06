import React from 'react';
import {
  colors,
  FormControl,
  SvgIcon,
  IconButton,
} from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import { useState } from '@hookstate/core';
import { FilterType } from '../../molecules';
import { featureState } from '../../../App';
import { capitalize } from '../../../functions';
import { ValueFilter, RangeFilter, KeywordFilter } from '../../molecules';

/*
 *******************************************************************************
 *****************************   STYLES   **************************************
 *******************************************************************************
 */

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%'
  },
  formControl: {
    margin: theme.spacing(1),
    width: `calc(100% - 2 * ${theme.spacing(1)}px)`,
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '5%'
  },
  filterLabel: {
    margin: 0, 
    top: 5, 
    marginTop: 7, 
    flex: '0 1 10%'
  },
  sortButton: {
    top: 5,
    width: '5%',
    borderRadius: '25%',
    border: '1px solid',
    padding: '0 !important',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
}));

const ButtonArrowIcon = (
  sort: string
): JSX.Element => {
  if (sort === 'asc') return <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" transform="scale(0.5,1) translate(24,1)"></path>;
  else if (sort === 'desc') return <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" transform="scale(0.5,1) translate(24,1)"></path>;
  return <path d="M13 6.99h3L12 3 8 6.99h3v10.02H8L12 21l4-3.99h-3z" transform="scale(0.75, 1) translate(13,0)"></path>;
};

const sortButtonTheme = createMuiTheme({
  palette: {
    primary: {main: colors.blue[500]},
    secondary: {main: colors.red[500]},
    error: {main: colors.green[500]}
  }
});
const getSortButtonColor: (sort: SortOrder | undefined) => string = 
  sort => {
    if (sort === 'asc') return sortButtonTheme.palette.secondary.main;
    else if (sort === 'desc') return sortButtonTheme.palette.error.main;
    return sortButtonTheme.palette.primary.main;
  };

const FILTERS = ['url', 'words.title', 'words.author', 'words.date', 'words.length'];

interface FilterAreaProps {
  filter: FilterType;
  filterIdx: number;
}
const FilterArea: React.FC<FilterAreaProps> = (
  props: FilterAreaProps
) => {
  const filterProps = {
    filterName: props.filter.name,
    filterIdx: props.filterIdx
  };
  if (props.filter.values) {
    return <ValueFilter {...filterProps} />;
  } else if (props.filter.range) {
    return <RangeFilter {...filterProps} />;
  } else {
    return <KeywordFilter {...filterProps} />;
  }
};

export const FilterSorterBox: React.FC = () => {
  const state = useState(featureState);
  const styles = useStyles();

  const onSortClick = (
    idx: number
  ) => (): void => {
    const direction: string = {
      ['normal' as string]: 'asc',
      ['asc' as string]: 'desc'
    }[state.features[idx].direction.get() as string] || 'normal';
    state.features[idx].set(p => 
      direction === 'normal'
      ? { filter: p.filter }
      : { ...p, direction: direction as SortOrder });
  };

  return (
  <div 
    className={styles.container} 
    data-testid="FilterSorterBox" >
    {FILTERS.map((filter,i) => (
    <FormControl className={styles.formControl} key={'control' + filter}>
      <p id={`${filter}-filter-label`} className={styles.filterLabel}>
        {capitalize(filter)}
      </p>
      <IconButton
        onClick={onSortClick(i)} 
        className={styles.sortButton}
        style={{
          borderColor: getSortButtonColor(state.features[i].direction.get())
        }}>
        <SvgIcon htmlColor={getSortButtonColor(state.features[i].direction.get())}>
          <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" transform="scale(0.7, 1)"></path>
          <ButtonArrowIcon {...state.features[i].direction.get() as string}/>
        </SvgIcon>
      </IconButton>
      <FilterArea filter={state.features[i].filter.get()} filterIdx={i} />
    </FormControl>
    ))}
  </div>);
};