import React from 'react';
import { screen } from '@testing-library/react';
import { Item, ItemProps } from '../';
import { shallow, ShallowWrapper } from 'enzyme';

describe("Item Testing", () => {

  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<Item />);
  });

  it('renders default successfully', () => {
    expect(screen.getByTestId(/Item/)).toBeInTheDocument();
    expect(screen.getByTestId(/Item/).getAttribute('href')).toBe('https://www.google.com');
    expect(screen.getByTestId(/Item/)).not.toHaveAttribute('title');
  });

  it('renders specific data fully', () => {
    const data: ItemProps = {
      url: 'https://www.youtube.com/watch?v=XMKNdkDmjwY',
      logo: {
        src: 'https://www.youtube.com/favicon.ico',
      },
      words: {
        title: 'CYBERPUNK 2077 Walkthrough Gameplay Part 10 = TAKEMURA (FULL GAME)',
        author: 'theRadBrad',
        date: '12/11/2020',
        length: '00:24:21'
      }
    };
    wrapper = shallow(<Item {...data} />);
    expect(screen.getByTestId(/Item/)).toBeInTheDocument();
    expect(screen.getByTestId(/Item/).getAttribute('href')).toBe(data.url);
    expect(screen.getByTestId(/Item/).getAttribute('title')).toBe(data.words?.title);
  });
});

