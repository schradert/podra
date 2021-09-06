import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Slider } from '@material-ui/core';
import { AreaChart, Area } from 'recharts'; 
import { featureState, FILTERS } from '../../../App';
import { useState } from '@hookstate/core';
import { deepElement } from '..';
import { 
  dateNumberToString, 
  dateStringToNumber, 
  lengthNumberToString, 
  lengthStringToNumber 
} from '../../../functions';

const RangeSlider = withStyles({
  root: {
    color: '#3a8589',
    height: 3,
    padding: '13px 0',
  },
  thumb: {
    height: 27,
    width: 27,
    backgroundColor: '#fff',
    border: '1px solid currentColor',
    marginTop: -12,
    marginLeft: -13,
    boxShadow: '#ebebeb 0 2px 2px',
    '&:focus, &:hover, &$active': {
      boxShadow: '#ccc 0 2px 3px 1px',
    },
    '& .bar': {
      height: 9,
      width: 1,
      backgroundColor: 'currentColor',
      marginLeft: 1,
      marginRight: 1,
    },
  },
  active: {},
  track: {
    height: 3,
  },
  rail: {
    color: '#d8d8d8',
    opacity: 1,
    height: 3,
  },
})(Slider);

export interface RangeFilterProps {
  filterName: string;
  binCount?: number;
}
export const RangeFilter: React.FC<RangeFilterProps> = ({
  filterName,
  binCount = 20
}: RangeFilterProps) => {
  const [toNum, toString] = 
    filterName === 'words.length' 
    ? [lengthStringToNumber, lengthNumberToString]
    : [dateStringToNumber, dateNumberToString];
  const filterIdx = FILTERS.indexOf(filterName);
  const state = useState(featureState);
  const [min, max, bins, minString, maxString] = React.useMemo(
    () => {
      const vals = state.results.map(el => deepElement(filterName, el.get()));
      const minString = vals.reduce(
        (min_, val) => val.localeCompare(min_) < 0 ? val : min_);
      const maxString = vals.reduce(
        (max_, val) => val.localeCompare(max_) > 0 ? val : max_);
      const minNum = toNum(minString);
      const maxNum = toNum(maxString);
      const interval = (maxNum - minNum) / binCount;
      const bins = Array(binCount).fill({ count: 0 });
      vals.forEach(val => bins[(toNum(val) - minNum) / interval >> 0].count++);
      return [minNum, maxNum, bins, minString, maxString];
    }, [state.results]);

  const handleRangeChange = (
    _: React.ChangeEvent<unknown>,
    vals: number | number[]
  ): void => {
    const valsAsStr = (vals as number[]).map(val => toString(val));
    state.features[filterIdx].filter.range.set(valsAsStr as [string, string]);
  };

  const getRange = (): number[] => {
    const valsAsString = state.features[filterIdx].filter.range.get();
    return (valsAsString as string[]).map(val => toNum(val));
  };
  const marks = [
    { value: min, label: minString }, 
    { value: max, label: maxString }
  ];

  return (
  <>
    <AreaChart width={200} height={60} data={bins}>
      <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
    </AreaChart>
    <RangeSlider 
      data-testid="RangeFilter"
      getAriaLabel={(idx: number) => `${filterName} Slider - Step ${idx}`}
      getAriaValueText={(val: number, idx: number) => 
        `value at ${filterName} slider step ${idx} is ${toString(val)}`}
      defaultValue={[min, max]}
      min={min} max={max}
      onChange={handleRangeChange}
      value={getRange()}
      valueLabelDisplay="auto"
      valueLabelFormat={toString}
      marks={marks}
    />
  </>);
};