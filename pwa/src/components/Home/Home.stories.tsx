import { Home } from "./";
import { Story, Meta } from "@storybook/react";

export default {
    title: "templates/Home",
    component: Home,
    argTypes: {},
} as Meta;
const Template: Story = (args) => <Home {...args} />;

export const Default = Template.bind({});
Default.args = {};
