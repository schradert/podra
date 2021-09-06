import React from 'react';
import { screen } from '@testing-library/react';
import { Home } from '../';
import { shallow, ShallowWrapper } from 'enzyme';

describe("Home Testing", () => {

  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<Home />);
  });

  it('renders default successfully', () => {
    expect(screen.getByTestId(/Home/)).toBeInTheDocument();
  });
});

