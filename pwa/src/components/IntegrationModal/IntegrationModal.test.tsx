import { IntegrationModal } from "../";
import { shallow, ShallowWrapper } from "enzyme";

describe("IntegrationModal Testing", () => {
    let wrapper: ShallowWrapper;
    beforeEach(() => {
        wrapper = shallow(<IntegrationModal />);
    });

    it("renders default successfully", () => {
        expect(
            wrapper.exists("[data-test-id='IntegrationModal']")
        ).toBeTruthy();
    });
});
