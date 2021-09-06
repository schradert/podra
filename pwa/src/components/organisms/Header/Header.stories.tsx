import React from 'react';
import { Header, HeaderProps } from './';
import { Story, Meta } from '@storybook/react/types-6-0';

export default {
    title: 'organisms/Header',
    component: Header,
    argTypes: {

    }
} as Meta;
const Template: Story<HeaderProps> = args => <Header {...args} />;

export const Default = Template.bind({});
Default.args = {

};