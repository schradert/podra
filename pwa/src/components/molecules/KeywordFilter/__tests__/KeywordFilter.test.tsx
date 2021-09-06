import React from 'react';
import { screen } from '@testing-library/react';
import { KeywordFilter } from '../';
import { shallow, ShallowWrapper } from 'enzyme';

describe("KeywordFilter Testing", () => {

  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<KeywordFilter />);
  });

  it('renders default successfully', () => {
    expect(screen.getByTestId(/KeywordFilter/)).toBeInTheDocument();
  });
});

