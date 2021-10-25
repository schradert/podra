import { ItemList, ItemListProps } from ".";
import { ItemProps } from "../";
import { Story, Meta } from "@storybook/react";

const list: ItemProps[] = [
    {
        url: "https://medium.com/@gilfink/adding-web-interception-abilities-to-your-chrome-extension-fb42366df425",
        logo: {
            src: "https://www.medium.com/favicon.ico",
        },
        words: {
            title: "Adding Web Interception Abilities to Your Chrome Extension",
            author: "Gil Fink",
            date: "2018-01-30",
            length: "00:05:00",
        },
    },
    {
        url: "https://www.youtube.com/watch?v=DH7QVll30XQ&list=PLC3y8-rFHvwg2-q6Kvw3Tl_4xhxtIaNlY&index=23&t=152s",
        logo: {
            src: "https://www.youtube.com/favicon.ico",
        },
        words: {
            title: "Chrome Extension Tutorial - 23 - Context Menu Functionality",
            author: "Codevolution",
            date: "2016-09-18",
            length: "00:05:27",
        },
    },
    {
        url: "https://en.wikipedia.org/wiki/Project_Veritas",
        logo: {
            src: "https://www.wikipedia.com/favicon.ico",
        },
        words: {
            title: "Project Veritas",
            author: "unknown",
            date: "2020-11-20",
            length: "00:40:00",
        },
    },
    {
        url: "https://material-ui.com/components/selects/#select",
        logo: {
            src: "https://www.material-ui.com/favicon.ico",
        },
        words: {
            title: "Select",
            author: "unknown",
            date: "today",
            length: "00:05:00",
        },
    },
    {
        url: "https://css-tricks.com/almanac/properties/g/gap/",
        logo: {
            src: "https://www.css-tricks.com/favicon.ico",
        },
        words: {
            title: "gap",
            author: "Mojtaba Seyedi",
            date: "2020-08-13",
            length: "00:15:00",
        },
    },
];

export default {
    title: "molecules/ItemList",
    component: ItemList,
    args: { list },
} as Meta;
const Template: Story<ItemListProps> = (args) => <ItemList {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const UrlFilter = Template.bind({});
UrlFilter.args = {
    filters: [{ name: "url", values: ["youtube", "wikipedia"] }],
};

export const TitleSort = Template.bind({});
TitleSort.args = {
    sort: [{ name: "words.title", direction: "desc" }],
};

export const DateFilterSort = Template.bind({});
DateFilterSort.args = {
    filters: [{ name: "words.date", range: ["-", "2020-08-13"] }],
    sort: [{ name: "words.date", direction: "desc" }],
};
