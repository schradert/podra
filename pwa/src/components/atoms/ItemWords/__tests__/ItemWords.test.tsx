import React from 'react';
import { screen } from '@testing-library/react';
import { ItemWords, ItemWordsProps } from '../';

import { shallow, ShallowWrapper } from 'enzyme';

describe("ItemWords Testing", () => {

  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<ItemWords />);
  });

  it('renders default successfully', () => {
    expect(screen.getByTestId(/ItemWords/)).toBeInTheDocument();
    expect(wrapper.find('.title').text()).toBe('... [no title extracted] ...');
    expect(wrapper.find('.subtitles').first().text()).toBe('unknown');
    expect(wrapper.find('.subtitles').last().text()).toBe(`${(new Date()).toLocaleDateString()} &#8226; 5m 0s`);
  });

  it('renders specific attributes successfully', () => {
    const props: ItemWordsProps = {
      title: 'Test Title',
      author: 'Test Author',
      date: 'Test Date',
      length: 'Test Length'
    };
    wrapper = shallow(<ItemWords {...props} />);
    expect(wrapper.find('.title').text()).toBe(props.title);
    expect(wrapper.find('.subtitles').first().text()).toBe(props.author);
    expect(wrapper.find('.subtitles').last().text()).toBe(`${props.date} &#8226; ${props.length}`);
  })
});