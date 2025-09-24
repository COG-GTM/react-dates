import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon-sandbox';

import DateInput from '../../src/components/DateInput';

const event = { preventDefault() {}, stopPropagation() {} };

describe('DateInput - Complementary Tests', () => {
  describe('HTML attributes', () => {
    it('renders input with autoComplete prop', () => {
      const autoComplete = 'new-password';
      const wrapper = shallow(<DateInput id="date" autoComplete={autoComplete} />).dive();
      expect(wrapper.find('input').prop('autoComplete')).to.equal(autoComplete);
    });

    it('renders input with disabled prop', () => {
      const wrapper = shallow(<DateInput id="date" disabled />).dive();
      expect(wrapper.find('input').prop('disabled')).to.equal(true);
    });

    it('renders input with required prop', () => {
      const wrapper = shallow(<DateInput id="date" required />).dive();
      expect(wrapper.find('input').prop('required')).to.equal(true);
    });

    it('applies disabled styling when disabled prop is true', () => {
      const wrapper = shallow(<DateInput id="date" disabled />).dive();
      const containerProps = wrapper.props();
      const inputProps = wrapper.find('input').props();
      
      expect(containerProps.className).to.include('DateInput__disabled');
      expect(inputProps.className).to.include('DateInput_input__disabled');
    });
  });

  describe('#componentDidUpdate', () => {
    it('focuses input when focused and isFocused become true', () => {
      const mockInputRef = { focus: sinon.spy() };
      const wrapper = shallow(
        <DateInput id="date" focused={false} isFocused={false} />,
        { disableLifecycleMethods: false }
      ).dive();
      
      wrapper.instance().inputRef = mockInputRef;
      wrapper.setProps({ focused: true, isFocused: true });
      
      expect(mockInputRef.focus.callCount).to.equal(1);
    });

    it('does not focus input when only focused becomes true', () => {
      const mockInputRef = { focus: sinon.spy() };
      const wrapper = shallow(
        <DateInput id="date" focused={false} isFocused={false} />,
        { disableLifecycleMethods: false }
      ).dive();
      
      wrapper.instance().inputRef = mockInputRef;
      wrapper.setProps({ focused: true, isFocused: false });
      
      expect(mockInputRef.focus.callCount).to.equal(0);
    });

    it('does not focus input when only isFocused becomes true', () => {
      const mockInputRef = { focus: sinon.spy() };
      const wrapper = shallow(
        <DateInput id="date" focused={false} isFocused={false} />,
        { disableLifecycleMethods: false }
      ).dive();
      
      wrapper.instance().inputRef = mockInputRef;
      wrapper.setProps({ focused: false, isFocused: true });
      
      expect(mockInputRef.focus.callCount).to.equal(0);
    });
  });

  describe('#setInputRef', () => {
    it('sets inputRef property when called', () => {
      const wrapper = shallow(<DateInput id="date" />).dive();
      const mockRef = { focus: () => {} };
      
      wrapper.instance().setInputRef(mockRef);
      
      expect(wrapper.instance().inputRef).to.equal(mockRef);
    });

    it('is called when input is rendered', () => {
      const wrapper = shallow(<DateInput id="date" />).dive();
      const input = wrapper.find('input');
      
      expect(input.prop('ref')).to.equal(wrapper.instance().setInputRef);
    });
  });

  describe('throttled keyboard handling', () => {
    it('throttles onFinalKeyDown calls', () => {
      const onKeyDownTabStub = sinon.stub();
      const wrapper = shallow(<DateInput id="date" onKeyDownTab={onKeyDownTabStub} />).dive();
      const instance = wrapper.instance();
      
      const throttledSpy = sinon.spy(instance, 'throttledKeyDown');
      
      instance.onKeyDown({ ...event, key: 'a' });
      instance.onKeyDown({ ...event, key: 'b' });
      instance.onKeyDown({ ...event, key: 'c' });
      
      expect(throttledSpy.callCount).to.equal(3);
      
      throttledSpy.restore();
    });

    it('does not throttle modifier keys', () => {
      const wrapper = shallow(<DateInput id="date" />).dive();
      const instance = wrapper.instance();
      
      const throttledSpy = sinon.spy(instance, 'throttledKeyDown');
      
      instance.onKeyDown({ ...event, key: 'Shift' });
      instance.onKeyDown({ ...event, key: 'Control' });
      instance.onKeyDown({ ...event, key: 'Alt' });
      
      expect(throttledSpy.callCount).to.equal(0);
      
      throttledSpy.restore();
    });
  });

  describe('prop combinations', () => {
    it('handles multiple props correctly', () => {
      const props = {
        id: 'test-input',
        placeholder: 'Enter date',
        displayValue: '2023-12-25',
        ariaLabel: 'Date selection',
        autoComplete: 'bday',
        disabled: true,
        required: true,
        readOnly: false
      };
      
      const wrapper = shallow(<DateInput {...props} />).dive();
      const input = wrapper.find('input');
      
      expect(input.prop('value')).to.equal('2023-12-25');
      expect(input.prop('placeholder')).to.equal('Enter date');
      expect(input.prop('aria-label')).to.equal('Date selection');
      expect(input.prop('autoComplete')).to.equal('bday');
      expect(input.prop('disabled')).to.equal(true);
      expect(input.prop('required')).to.equal(true);
      expect(input.prop('readOnly')).to.equal(false);
    });
  });
});
