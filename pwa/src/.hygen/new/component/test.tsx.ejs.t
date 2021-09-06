---
to: <%= absPath %>/__tests__/<%= component_name %>.test.tsx
---

import React from 'react';
import { screen } from '@testing-library/react';
import { <%= component_name %> } from '../';
import { shallow, ShallowWrapper } from 'enzyme';

describe("<%= component_name %> Testing", () => {

  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<<%= component_name %> />);
  });

  it('renders default successfully', () => {
    expect(screen.getByTestId(/<%= component_name %>/)).toBeInTheDocument();
  });
});

