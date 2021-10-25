import { SWReloadPrompt } from "./";
import { shallow, ShallowWrapper } from "enzyme";

describe("SWReloadPrompt Testing", () => {
    let wrapper: ShallowWrapper;
    beforeEach(() => {
        wrapper = shallow(<SWReloadPrompt />);
    });

    it("renders default successfully", () => {
        expect(wrapper.exists("[data-test-id='SWReloadPrompt']")).toBeTruthy();
    });
});
