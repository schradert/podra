import React from 'react';
import { screen } from '@testing-library/react';
import { FilterSorterBox } from '../';
import { shallow, ShallowWrapper } from 'enzyme';

describe("FilterSorterBox Testing", () => {

  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<FilterSorterBox />);
  });

  it('renders default successfully', () => {
    expect(screen.getByTestId(/FilterSorterBox/)).toBeInTheDocument();
  });
});

