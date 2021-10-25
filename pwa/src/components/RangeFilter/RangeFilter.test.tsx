import { RangeFilter, RangeFilterProps } from "../";
import { shallow, ShallowWrapper } from "enzyme";

describe("RangeFilter Testing", () => {
    const props: RangeFilterProps = {
        filterName: "",
    };
    let wrapper: ShallowWrapper;
    beforeEach(() => {
        wrapper = shallow(<RangeFilter {...props} />);
    });

    it("renders default successfully", () => {
        expect(wrapper.exists("[data-test-id='RangeFilter']")).toBeTruthy();
    });
});
