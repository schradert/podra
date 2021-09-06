---
to: <%= absPath %>/<%= component_name %>.stories.tsx
---
import React from 'react';
import { <%= component_name %>, <%= component_name %>Props } from './';
import { Story, Meta } from '@storybook/react/types-6-0';

export default {
    title: '<%= category %>/<%= component_name %>',
    component: <%= component_name %>,
    argTypes: {

    }
} as Meta;
const Template: Story<<%= component_name %>Props> = args => <<%= component_name %> {...args} />;

export const Default = Template.bind({});
Default.args = {

};