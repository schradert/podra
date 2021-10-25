import { KeywordFilter, KeywordFilterProps } from "../";
import { shallow, ShallowWrapper } from "enzyme";

describe("KeywordFilter Testing", () => {
    const props: KeywordFilterProps = {
        filterName: "",
        filterIdx: 0,
    };
    let wrapper: ShallowWrapper;
    beforeEach(() => {
        wrapper = shallow(<KeywordFilter {...props} />);
    });

    it("renders default successfully", () => {
        expect(wrapper.exists("[data-test-id='KeywordFilter']")).toBeTruthy();
    });
});
