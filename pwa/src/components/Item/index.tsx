import { ItemLogo, ItemLogoProps, ItemWords, ItemWordsProps } from "../";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles(() => ({
    container: {
        width: "calc(100% - 2 * 1px)",
        height: "calc(50px - 2 * 1px)",
        backgroundColor: "#f9bb2d",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        alignContent: "center",
        border: "1px solid black",
        textDecoration: "none",
        color: "black",
    },
}));
export interface ItemProps {
    url?: string;
    logo?: ItemLogoProps;
    words?: ItemWordsProps;
}

export const Item: React.FC<ItemProps> = ({
    url = "https://www.google.com",
    logo,
    words,
}: ItemProps) => {
    const styles = useStyles();
    return (
        <a
            className={styles.container}
            data-test-id="Item"
            title={words?.title}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
        >
            <ItemLogo {...logo} />
            <ItemWords {...words} />
        </a>
    );
};
