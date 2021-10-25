import { ItemWords } from ".";
import { shallow, ShallowWrapper } from "enzyme";

describe("ItemWords Testing", () => {
    let wrapper: ShallowWrapper;
    beforeEach(() => {
        wrapper = shallow(<ItemWords />);
    });

    it("renders default successfully", () => {
        expect(wrapper.exists("[data-test-id='ItemWords']")).toBeTruthy();
    });
});
