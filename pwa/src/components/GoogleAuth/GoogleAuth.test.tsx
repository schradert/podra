import { GoogleAuth } from "../";
import { shallow, ShallowWrapper } from "enzyme";

describe("GoogleAuth Testing", () => {
  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<GoogleAuth />);
  });

  it("renders default successfully", () => {
    expect(wrapper.exists("[data-test-id='GoogleAuth']")).toBeTruthy();
  });
});
