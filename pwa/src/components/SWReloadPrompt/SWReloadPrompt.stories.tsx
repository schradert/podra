import { SWReloadPrompt, SWReloadPromptProps } from "./";
import { Story, Meta } from "@storybook/react";

export default {
  title: "SWReloadPrompt",
  component: SWReloadPrompt,
  argTypes: {},
} as Meta;
const Template: Story<SWReloadPromptProps> = (args) => (
  <SWReloadPrompt {...args} />
);

export const Default = Template.bind({});
Default.args = {};
