import { Home } from "../";
import { shallow, ShallowWrapper } from "enzyme";

describe("Home Testing", () => {
    let wrapper: ShallowWrapper;
    beforeEach(() => {
        wrapper = shallow(<Home />);
    });

    it("renders default successfully", () => {
        expect(wrapper.exists("[data-test-id='Home']")).toBeTruthy();
    });
});
