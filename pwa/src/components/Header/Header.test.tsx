import { Header } from "../";
import { shallow, ShallowWrapper } from "enzyme";

describe("Header Testing", () => {
  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<Header />);
  });

  it("renders default successfully", () => {
    expect(wrapper.exists("[data-test-id='Header']")).toBeTruthy();
  });
});
