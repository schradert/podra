import React from 'react';
import { IntegrationModal } from './';
import { Story, Meta } from '@storybook/react/types-6-0';

export default {
    title: 'organisms/IntegrationModal',
    component: IntegrationModal,
    argTypes: {

    }
} as Meta;
const Template: Story = args => <IntegrationModal {...args} />;

export const Default = Template.bind({});
Default.args = {

};