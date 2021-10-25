import { ItemLogo, ItemLogoProps } from ".";
import { Story, Meta } from "@storybook/react";

export default {
    title: "atoms/ItemLogo",
    component: ItemLogo,
    argTypes: {
        src: {
            name: "Source String",
            type: { name: "enum", required: true },
            defaultValue: "https://www.youtube.com/favicon.ico",
            description:
                "Source URL of a service's favicon.ico. Some examples Listed",
            control: {
                type: "select",
                options: [
                    "https://www.youtube.com/favicon.ico",
                    "https://www.medium.com/favicon.ico",
                    "https://www.quora.com/favicon.ico",
                    "https://www.reddit.com/favicon.ico",
                ],
            },
        },
        width: {
            name: "Logo Width",
            type: { name: "number", required: true },
            defaultValue: 32,
            description: "Width (in px) of the logo image",
            control: {
                type: "range",
                min: 16,
                max: 128,
                step: 16,
            },
        },
        height: {
            name: "Logo Height",
            type: { name: "number", required: true },
            defaultValue: 32,
            description: "Height (in px) of the logo image",
            control: {
                type: "range",
                min: 16,
                max: 128,
                step: 16,
            },
        },
    },
} as Meta;
const Template: Story<ItemLogoProps> = (args) => <ItemLogo {...args} />;

export const Default = Template.bind({});
Default.args = {
    src: "https://www.youtube.com/favicon.ico",
    width: 32,
    height: 32,
};

export const Tiny = Template.bind({});
Tiny.args = {
    src: "https://www.reddit.com/favicon.ico",
    width: 16,
    height: 16,
};

export const Big = Template.bind({});
Big.args = {
    src: "https://www.medium.com/favicon.ico",
    width: 128,
    height: 128,
};
