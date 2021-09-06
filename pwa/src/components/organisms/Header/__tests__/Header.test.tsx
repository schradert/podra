import React from 'react';
import { screen } from '@testing-library/react';
import { Header } from '../';
import { shallow, ShallowWrapper } from 'enzyme';

describe("Header Testing", () => {

  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<Header />);
  });

  it('renders default successfully', () => {
    expect(screen.getByTestId(/Header/)).toBeInTheDocument();
  });
});

