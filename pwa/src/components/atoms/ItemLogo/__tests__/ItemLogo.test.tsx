import React from 'react';
import { screen } from '@testing-library/react';
import { ItemLogo } from '../';

import { shallow, ShallowWrapper } from 'enzyme';

describe("ItemLogo Testing", () => {

  let wrapper: ShallowWrapper;
  const src = 'https://www.youtube.com/favicon.ico';
  beforeEach(() => {
    wrapper = shallow(<ItemLogo src={src} width={32} height={32} />);
  });

  it('renders successfully', () => {
    expect(screen.getByTestId(/ItemLogo/)).toBeInTheDocument();
    expect(wrapper.find('img')).toHaveAttribute('src', src);
  });

  it('styles image hover correctly', () => {
    wrapper.find('img').simulate('mouseover');
    expect(wrapper.find('img')).toHaveStyle({
      border: '1px solid #33ffff',
      borderRadius: '10%',
      opacity: 0.3
    });
    wrapper.find('img').simulate('mouseoff');
    expect(wrapper.find('img')).toHaveStyle({
      border: 'none',
      borderRadius: '0%',
      opacity: 1.0
    });
  });
});