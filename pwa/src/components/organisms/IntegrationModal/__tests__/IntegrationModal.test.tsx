import React from 'react';
import { screen } from '@testing-library/react';
import { IntegrationModal } from '../';
import { shallow, ShallowWrapper } from 'enzyme';

describe("IntegrationModal Testing", () => {

  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(<IntegrationModal />);
  });

  it('renders default successfully', () => {
    expect(screen.getByTestId(/IntegrationModal/)).toBeInTheDocument();
  });
});

