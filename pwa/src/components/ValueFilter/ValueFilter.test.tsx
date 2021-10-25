import { ValueFilter, ValueFilterProps } from "../";
import { shallow, ShallowWrapper } from "enzyme";

describe("ValueFilter Testing", () => {
    const props: ValueFilterProps = {
        filterName: "",
        filterIdx: 0,
    };
    let wrapper: ShallowWrapper;
    beforeEach(() => {
        wrapper = shallow(<ValueFilter {...props} />);
    });

    it("renders default successfully", () => {
        expect(wrapper.exists("[data-test-id='ValueFilter']")).toBeTruthy();
    });
});
