import { ItemLogo } from ".";

import { mount, ReactWrapper } from "enzyme";

describe("ItemLogo Testing", () => {
    let wrapper: ReactWrapper;
    const src = "https://www.youtube.com/favicon.ico";
    beforeEach(() => {
        wrapper = mount(<ItemLogo src={src} width={32} height={32} />);
    });

    it("renders successfully", () => {
        expect(wrapper.exists("[data-test-id='ItemLogo>']")).toBeTruthy();
        expect(wrapper.find("img")).toHaveAttribute("src", src);
    });

    it("styles image hover correctly", () => {
        wrapper.find("img").simulate("mouseover");
        expect(wrapper.find("img").getElement()).toHaveStyle({
            border: "1px solid #33ffff",
            borderRadius: "10%",
            opacity: 0.3,
        });
        wrapper.find("img").simulate("mouseoff");
        expect(wrapper.find("img").getElement()).toHaveStyle({
            border: "none",
            borderRadius: "0%",
            opacity: 1.0,
        });
    });
});
