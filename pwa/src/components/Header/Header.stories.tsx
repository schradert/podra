import { Header, HeaderProps } from ".";
import { Story, Meta } from "@storybook/react";

export default {
    title: "organisms/Header",
    component: Header,
    argTypes: {},
} as Meta;
const Template: Story<HeaderProps> = (args) => <Header {...args} />;

export const Default = Template.bind({});
Default.args = {};
