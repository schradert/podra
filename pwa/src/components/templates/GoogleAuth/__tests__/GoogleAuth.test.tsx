import React from 'react';
import { screen } from '@testing-library/react';
import { GoogleAuth } from '../';
import { shallow, ShallowWrapper } from 'enzyme';

describe("GoogleAuth Testing", () => {

  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<GoogleAuth />);
  });

  it('renders default successfully', () => {
    expect(screen.getByTestId(/GoogleAuth/)).toBeInTheDocument();
  });
});

