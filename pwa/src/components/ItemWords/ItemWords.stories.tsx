import { ItemWords, ItemWordsProps } from ".";
import { Story, Meta } from "@storybook/react";

export default {
    title: "atoms/ItemWords",
    component: ItemWords,
    argTypes: {
        title: {
            name: "Item Title",
            type: { name: "enum", required: false },
            defaultValue: "... [no title extracted] ...",
            description: "Display name of the item, most likely the URL title.",
            control: {
                type: "select",
                options: [
                    "... [no title extracted] ...",
                    "Test Title",
                    "An extremely long title to help visualize the component under overflow conditions, which is likely to happen with long item titles like this",
                    "[YouTube] Dark Souls 2 Speedrun 1:05:21",
                ],
            },
        },
        author: {
            name: "Item Author/Service",
            type: { name: "enum", required: false },
            defaultValue: "unknown",
            description:
                "Display author of the item. Could be a content creator or just website name.",
            control: {
                type: "select",
                options: [
                    "unknown",
                    "Test Author",
                    "An extremely long author or service name to help visualize the component under overflow conditions, which is likely to happen with long strings like this",
                    "theRadBrad",
                ],
            },
        },
        date: {
            name: "Item Title",
            type: { name: "string", required: false },
            defaultValue: new Date().toLocaleDateString(),
            description:
                "Date the item was created or last edited. Defaults to current date.",
            control: {
                type: "date",
            },
        },
        length: {
            name: "Estimated Item Read/Listen Length",
            type: { name: "string", required: false },
            defaultValue: "00:05:00",
            description:
                "How long it takes to read/watch/listen through the item fully.",
            control: {
                type: "text",
            },
        },
    },
} as Meta;
const Template: Story<ItemWordsProps> = (args) => <ItemWords {...args} />;

export const Default = Template.bind({});
Default.args = {
    title: "... [no title extracted] ...",
    author: "unknown",
    date: new Date().toLocaleDateString(),
    length: "00:05:00",
};

export const RealExample = Template.bind({});
RealExample.args = {
    title: "[YouTube] Dark Souls 2 Speedrun 1:05:21",
    author: "theRadBrad",
    date: "12/11/2018",
    length: "01:05:21",
};

export const Overflowing = Template.bind({});
Overflowing.args = {
    title: "An extremely long title to help visualize the component under overflow conditions, which is likely to happen with long item titles like this",
    author: "An extremely long author or service name to help visualize the component under overflow conditions, which is likely to happen with long strings like this",
};
