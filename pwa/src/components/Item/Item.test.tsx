import { screen, render } from "@testing-library/react";
import { Item, ItemProps } from "../";

describe("Item Testing", () => {
  it("renders default successfully", () => {
    render(<Item />);
    const item = screen.getByTestId("Item");

    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute("href", "https://www.google.com");
    expect(item).not.toHaveAttribute("title");
  });

  it("renders specific data fully", () => {
    const data: ItemProps = {
      url: "https://www.youtube.com/watch?v=XMKNdkDmjwY",
      logo: {
        src: "https://www.youtube.com/favicon.ico",
      },
      words: {
        title:
          "CYBERPUNK 2077 Walkthrough Gameplay Part 10 = TAKEMURA (FULL GAME)",
        author: "theRadBrad",
        date: "12/11/2020",
        length: "00:24:21",
      },
    };
    render(<Item {...data} />);
    const item = screen.getByTestId("Item");

    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute("href", data.url);
    expect(item).toHaveAttribute("title", data.words?.title);
  });
});
