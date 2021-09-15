import { RangeFilter, RangeFilterProps } from ".";
import { Story, Meta } from "@storybook/react";

export default {
  title: "molecules/RangeFilter",
  component: RangeFilter,
  argTypes: {},
} as Meta;
const Template: Story<RangeFilterProps> = (args) => <RangeFilter {...args} />;

export const Default = Template.bind({});
Default.args = {};
