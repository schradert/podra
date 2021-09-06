import React from 'react';
import { FilterSorterBox } from './';
import { Story, Meta } from '@storybook/react/types-6-0';

export default {
    title: 'organisms/FilterSorterBox',
    component: FilterSorterBox,
    argTypes: {

    }
} as Meta;
const Template: Story = args => <FilterSorterBox {...args} />;

export const Default = Template.bind({});
Default.args = {

};