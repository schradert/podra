---
to: <%= absPath %>/<%= component_name %>.test.tsx
---

import { <%= component_name %> } from './';
import { shallow, ShallowWrapper } from 'enzyme';

describe("<%= component_name %> Testing", () => {

  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<<%= component_name %> />);
  });

  it('renders default successfully', () => {
    expect(wrapper.exists("[data-test-id='<%= component_name %>']")).toBeTruthy();
  });
});

