import React from 'react';
import { Item, ItemProps } from './';
import { Story, Meta } from '@storybook/react/types-6-0';

export default {
    title: 'molecules/Item',
    component: Item,
    argTypes: {
      url: {
        name: 'Item Url',
        type: { name: 'string', required: true },
        defaultValue: 'https://www.google.com',
        description: 'The unique URL of the item',
        control: {
          type: 'text'
        }
      }
    }
} as Meta;
const Template: Story<ItemProps> = args => <Item {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const Specific = Template.bind({});
Specific.args = {
  url: 'https://www.youtube.com/watch?v=DH7QVll30XQ&list=PLC3y8-rFHvwg2-q6Kvw3Tl_4xhxtIaNlY&index=23&t=152s',
  logo: {
    src: 'https://www.youtube.com/favicon.ico'
  },
  words: {
    title: 'Chrome Extension Tutorial - 23 - Context Menu Functionality',
    author: 'Codevolution',
    date: '09-18-2016',
    length: '00:05:27',
  }
};