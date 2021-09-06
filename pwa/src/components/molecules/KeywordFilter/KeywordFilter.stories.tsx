import React from 'react';
import { KeywordFilter, KeywordFilterProps } from './';
import { Story, Meta } from '@storybook/react/types-6-0';

export default {
    title: 'molecules/KeywordFilter',
    component: KeywordFilter,
    argTypes: {

    }
} as Meta;
const Template: Story<KeywordFilterProps> = args => <KeywordFilter {...args} />;

export const Default = Template.bind({});
Default.args = {

};