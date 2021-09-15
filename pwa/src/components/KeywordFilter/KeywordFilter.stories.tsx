import { KeywordFilter, KeywordFilterProps } from ".";
import { Story, Meta } from "@storybook/react";

export default {
  title: "molecules/KeywordFilter",
  component: KeywordFilter,
  argTypes: {},
} as Meta;
const Template: Story<KeywordFilterProps> = (args) => (
  <KeywordFilter {...args} />
);

export const Default = Template.bind({});
Default.args = {};
