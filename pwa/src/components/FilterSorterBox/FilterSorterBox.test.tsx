import { FilterSorterBox } from "../";
import { shallow, ShallowWrapper } from "enzyme";

describe("FilterSorterBox Testing", () => {
  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<FilterSorterBox />);
  });

  it("renders default successfully", () => {
    expect(wrapper.exists("[data-test-id='FilterSorterBox']")).toBeTruthy();
  });
});
