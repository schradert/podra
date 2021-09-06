import React from 'react';
import { screen } from '@testing-library/react';
import { ValueFilter } from '../';
import { shallow, ShallowWrapper } from 'enzyme';

describe("ValueFilter Testing", () => {

  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<ValueFilter />);
  });

  it('renders default successfully', () => {
    expect(screen.getByTestId(/ValueFilter/)).toBeInTheDocument();
  });
});

