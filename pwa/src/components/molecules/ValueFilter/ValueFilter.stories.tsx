import React from 'react';
import { ValueFilter, ValueFilterProps } from './';
import { Story, Meta } from '@storybook/react/types-6-0';

export default {
    title: 'molecules/ValueFilter',
    component: ValueFilter,
    argTypes: {

    }
} as Meta;
const Template: Story<ValueFilterProps> = args => <ValueFilter {...args} />;

export const Default = Template.bind({});
Default.args = {

};