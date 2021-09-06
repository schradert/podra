import React from 'react';
import { screen } from '@testing-library/react';
import { RangeFilter } from '../';
import { shallow, ShallowWrapper } from 'enzyme';

describe("RangeFilter Testing", () => {

  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<RangeFilter />);
  });

  it('renders default successfully', () => {
    expect(screen.getByTestId(/RangeFilter/)).toBeInTheDocument();
  });
});

