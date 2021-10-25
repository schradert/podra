import { FilterSorterBox } from "./";
import type { Story, Meta } from "@storybook/react";

export default {
    title: "organisms/FilterSorterBox",
    component: FilterSorterBox,
    argTypes: {},
} as Meta;
const Template: Story = (args) => <FilterSorterBox {...args} />;

export const Default = Template.bind({});
Default.args = {};
