import React from 'react';
import { GoogleAuth } from './';
import { Story, Meta } from '@storybook/react/types-6-0';

export default {
    title: 'templates/GoogleAuth',
    component: GoogleAuth,
    argTypes: {

    }
} as Meta;
const Template: Story = args => <GoogleAuth {...args} />;

export const Default = Template.bind({});
Default.args = {

};