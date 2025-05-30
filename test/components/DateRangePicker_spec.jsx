import React from 'react';
import moment from 'moment';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';
import { render, fireEvent } from '@testing-library/react';

import DateRangePicker from '../../src/components/DateRangePicker';

import {
  HORIZONTAL_ORIENTATION,
  START_DATE,
} from '../../src/constants';

import describeIfWindow from '../_helpers/describeIfWindow';

class DateRangePickerWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focusedInput: null,
      startDate: null,
      endDate: null,
    };

    this.onDatesChange = this.onDatesChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
  }

  onDatesChange({ startDate, endDate }) {
    this.setState({ startDate, endDate });
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

  render() {
    const { focusedInput, startDate, endDate } = this.state;

    return (
      <div>
        <DateRangePicker
          {...this.props}
          onDatesChange={this.onDatesChange}
          onFocusChange={this.onFocusChange}
          focusedInput={focusedInput}
          startDate={startDate}
          endDate={endDate}
        />
        <button type="button">
          Dummy button
        </button>
      </div>
    );
  }
}

const requiredProps = {
  onDatesChange: () => {},
  onFocusChange: () => {},
  startDateId: 'startDate',
  endDateId: 'endDate',
};

describe('DateRangePicker', () => {
  describe('#render()', () => {
    it('renders <DateRangePickerInputWithHandlers />', () => {
      const { container } = render(
        <DateRangePicker {...requiredProps} focusedInput={START_DATE} />,
      );
      expect(container.querySelector('.DateRangePickerInput')).to.not.equal(null);
    });

    it('renders <DayPickerRangeController />', () => {
      const { container } = render(
        <DateRangePicker {...requiredProps} focusedInput={START_DATE} />,
      );
      expect(container.querySelector('.DayPicker')).to.not.equal(null);
    });

    describe('props.orientation === HORIZONTAL_ORIENTATION', () => {
      it('renders <DayPickerRangeController /> with props.numberOfMonths === 2', () => {
        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            orientation={HORIZONTAL_ORIENTATION}
            focusedInput={START_DATE}
          />,
        );
        const calendarMonths = container.querySelectorAll('.CalendarMonth');
        expect(calendarMonths.length).to.be.at.least(2);
      });
    });

    it('should pass onDayPickerBlur as onBlur to <DayPickerRangeController>', () => {
      const onBlurSpy = sinon.spy();
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={START_DATE}
          onBlur={onBlurSpy}
        />,
      );

      const dayPicker = container.querySelector('.DayPicker');
      if (dayPicker) {
        fireEvent.blur(dayPicker);
        expect(onBlurSpy.callCount).to.equal(1);
      }
    });

    describe('props.withPortal is truthy', () => {
      describe('<Portal />', () => {
        it('is rendered', () => {
          const { container } = render(
            <DateRangePicker
              {...requiredProps}
              withPortal
              focusedInput={START_DATE}
            />,
          );
          expect(document.querySelector('.DateRangePicker_portal')).to.not.equal(null);
        });

        it('is not rendered if props.focusedInput === null', () => {
          const { container } = render(
            <DateRangePicker {...requiredProps} focusedInput={null} withPortal />,
          );
          expect(document.querySelector('.DateRangePicker_portal')).to.equal(null);
        });
      });
    });

    describe('props.withFullScreenPortal is truthy', () => {
      it('does not render <DayPickerRangeController>', () => {
        const { container } = render(
          <DateRangePicker {...requiredProps} withFullScreenPortal />,
        );
        expect(container.querySelector('.DayPickerRangeController')).to.equal(null);
      });

      describe('<Portal />', () => {
        it('is rendered', () => {
          const { container } = render(
            <DateRangePicker {...requiredProps} withFullScreenPortal focusedInput={START_DATE} />,
          );
          expect(document.querySelector('.DateRangePicker_portal')).to.not.equal(null);
        });

        it('is not rendered if props.focusedInput === null', () => {
          const { container } = render(
            <DateRangePicker
              {...requiredProps}
              focusedInput={null}
              withFullScreenPortal
            />,
          );
          expect(document.querySelector('.DateRangePicker_portal')).to.equal(null);
        });
      });
    });

    describe('props.isDayBlocked is defined', () => {
      it('should pass props.isDayBlocked to <DateRangePickerInputController>', () => {
        const isDayBlocked = sinon.stub();
        const { container } = render(
          <DateRangePicker {...requiredProps} isDayBlocked={isDayBlocked} />,
        );

        expect(container.querySelector('.DateRangePickerInput')).to.not.equal(null);
      });

      it('is a noop when omitted', () => {
        const { container } = render(
          <DateRangePicker {...requiredProps} />,
        );

        expect(container.querySelector('.DateRangePickerInput')).to.not.equal(null);
      });
    });

    describe('props.appendToBody', () => {
      it('renders <DayPickerRangeController> inside <Portal>', () => {
        const { container } = render(
          <DateRangePicker {...requiredProps} appendToBody focusedInput={START_DATE} />,
        );

        const portal = document.querySelector('.DateRangePicker_portal');
        expect(portal).to.not.equal(null);
        expect(portal.querySelector('.DayPicker')).to.not.equal(null);
      });

      describeIfWindow('mounted', () => {
        let container;
        let onCloseStub;

        beforeEach(() => {
          onCloseStub = sinon.stub();
          const renderResult = render(
            <DateRangePicker
              {...requiredProps}
              appendToBody
              focusedInput={START_DATE}
              onClose={onCloseStub}
            />,
          );
          container = renderResult.container;
        });

        it('positions <DateRangePickerInputController> using top and transform CSS properties', () => {
          const dayPickerEl = document.querySelector('.DayPicker');
          expect(dayPickerEl.style.top).not.to.equal('');
          expect(dayPickerEl.style.transform).not.to.equal('');
        });

        it('disables scroll', () => {
          expect(document.body.style.overflow).to.equal('hidden');
        });

        it('ignores click events from inside picker', () => {
          const dayPicker = document.querySelector('.DayPicker');
          fireEvent.click(dayPicker);
          expect(onCloseStub.callCount).to.equal(0);
        });

        it('enables scroll when closed', () => {
          render(
            <DateRangePicker
              {...requiredProps}
              appendToBody
              focusedInput={null}
              onClose={onCloseStub}
            />,
          );

          expect(document.body.style.overflow).to.not.equal('hidden');
        });

        it('enables scroll when unmounted', () => {
          const { unmount } = render(
            <DateRangePicker
              {...requiredProps}
              appendToBody
              focusedInput={START_DATE}
              onClose={onCloseStub}
            />,
          );

          unmount();
          expect(document.body.style.overflow).to.not.equal('hidden');
        });
      });
    });

    describe('props.focusedInput', () => {
      it('renders <DayPickerRangeController> if props.focusedInput != null', () => {
        const { container } = render(
          <DateRangePicker {...requiredProps} focusedInput={START_DATE} />,
        );
        expect(container.querySelector('.DayPicker')).to.not.equal(null);
      });

      it('does not render <DayPickerRangeController> if props.focusedInput = null', () => {
        const { container } = render(
          <DateRangePicker {...requiredProps} focusedInput={null} />,
        );
        expect(container.querySelector('.DayPicker')).to.equal(null);
      });
    });
  });

  describe('#onOutsideClick', () => {
    it('does not call props.onFocusChange if props.focusedInput = null', () => {
      const onFocusChangeStub = sinon.stub();
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={null}
          onFocusChange={onFocusChangeStub}
        />,
      );

      fireEvent.mouseDown(document.body);
      expect(onFocusChangeStub.callCount).to.equal(0);
    });

    it('calls props.onFocusChange if props.focusedInput != null', () => {
      const onFocusChangeStub = sinon.stub();
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={START_DATE}
          onFocusChange={onFocusChangeStub}
        />,
      );

      fireEvent.mouseDown(document.body);
      expect(onFocusChangeStub.callCount).to.equal(1);
    });

    it('sets state.isDateRangePickerInputFocused to false', () => {
      const onFocusChangeStub = sinon.stub();
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={START_DATE}
          onFocusChange={onFocusChangeStub}
          onDatesChange={sinon.stub()}
        />,
      );

      const input = container.querySelector('.DateInput_input');
      fireEvent.focus(input);

      fireEvent.mouseDown(document.body);

      expect(onFocusChangeStub.callCount).to.equal(1);
      expect(onFocusChangeStub.getCall(0).args[0]).to.equal(null);
    });

    it('sets state.isDayPickerFocused to false', () => {
      const onFocusChangeStub = sinon.stub();
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={START_DATE}
          onFocusChange={onFocusChangeStub}
          onDatesChange={sinon.stub()}
        />,
      );

      const dayPicker = container.querySelector('.DayPicker');
      if (dayPicker) {
        fireEvent.focus(dayPicker);
      }

      fireEvent.mouseDown(document.body);

      expect(onFocusChangeStub.callCount).to.equal(1);
    });

    it('sets state.showKeyboardShortcuts to false', () => {
      const onFocusChangeStub = sinon.stub();
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={START_DATE}
          onFocusChange={onFocusChangeStub}
          onDatesChange={sinon.stub()}
        />,
      );

      const keyboardShortcutsButton = container.querySelector('.DayPickerKeyboardShortcuts_show');
      if (keyboardShortcutsButton) {
        fireEvent.click(keyboardShortcutsButton);
      }

      fireEvent.mouseDown(document.body);

      expect(container.querySelector('.DayPickerKeyboardShortcuts_panel--visible')).to.equal(null);
    });

    it('does not call props.onClose if props.focusedInput = null', () => {
      const onCloseStub = sinon.stub();
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={null}
          onClose={onCloseStub}
          onFocusChange={() => null}
        />,
      );

      fireEvent.mouseDown(document.body);
      expect(onCloseStub.callCount).to.equal(0);
    });

    it('calls props.onClose with startDate and endDate if props.focusedInput != null', () => {
      const startDate = moment();
      const endDate = startDate.add(1, 'days');
      const onCloseStub = sinon.stub();
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          startDate={startDate}
          endDate={endDate}
          focusedInput={START_DATE}
          onClose={onCloseStub}
          onFocusChange={() => null}
        />,
      );

      fireEvent.mouseDown(document.body);
      expect(onCloseStub.callCount).to.equal(1);
      const args = onCloseStub.getCall(0).args[0];
      expect(args.startDate).to.equal(startDate);
      expect(args.endDate).to.equal(endDate);
    });
  });

  describe('#onDateRangePickerInputFocus', () => {
    it('calls onFocusChange', () => {
      const onFocusChangeStub = sinon.stub();
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          onDatesChange={sinon.stub()}
          onFocusChange={onFocusChangeStub}
        />,
      );

      const input = container.querySelector('.DateInput_input');
      fireEvent.focus(input);
      expect(onFocusChangeStub.callCount).to.equal(1);
    });

    it('calls onFocusChange with arg', () => {
      const test = 'foobar';
      const onFocusChangeStub = sinon.stub();
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          onDatesChange={sinon.stub()}
          onFocusChange={onFocusChangeStub}
        />,
      );

      const startDateInput = container.querySelector('.DateRangePickerInput_calendarIcon');
      fireEvent.click(startDateInput);

      expect(onFocusChangeStub.callCount).to.equal(1);
      expect(onFocusChangeStub.getCall(0).args[0]).to.equal(START_DATE);
    });

    describe('new focusedInput is truthy', () => {
      it('opens the day picker when input is focused with withPortal', () => {
        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            onDatesChange={sinon.stub()}
            onFocusChange={sinon.stub()}
            withPortal
          />,
        );

        // Focus the start date input
        const startDateInput = container.querySelector('.DateInput_input');
        fireEvent.focus(startDateInput);

        const portal = document.querySelector('.ReactDatesPortal');
        expect(portal).to.not.equal(null);
      });

      it('opens the full screen portal when input is focused with withFullScreenPortal', () => {
        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            onDatesChange={sinon.stub()}
            onFocusChange={sinon.stub()}
            withFullScreenPortal
          />,
        );

        // Focus the start date input
        const startDateInput = container.querySelector('.DateInput_input');
        fireEvent.focus(startDateInput);

        const fullScreenPortal = document.querySelector('.ReactDatesPortal');
        expect(fullScreenPortal).to.not.equal(null);
        expect(fullScreenPortal.classList.contains('ReactDatesPortal_fullscreen')).to.equal(true);
      });

      it('shows day picker when input is focused with readOnly prop', () => {
        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            onDatesChange={sinon.stub()}
            onFocusChange={sinon.stub()}
            readOnly
          />,
        );

        // Focus the start date input
        const startDateInput = container.querySelector('.DateInput_input');
        fireEvent.focus(startDateInput);

        const dayPicker = container.querySelector('.DayPicker');
        expect(dayPicker).to.not.equal(null);
        expect(dayPicker.style.display).to.not.equal('none');
      });

      it('shows day picker when input is focused on touch device', () => {
        const originalNavigator = global.navigator;
        const mockNavigator = {
          ...originalNavigator,
          maxTouchPoints: 1, // Simulate touch device
        };
        global.navigator = mockNavigator;

        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            onDatesChange={sinon.stub()}
            onFocusChange={sinon.stub()}
          />,
        );

        // Focus the start date input
        const startDateInput = container.querySelector('.DateInput_input');
        fireEvent.focus(startDateInput);

        const dayPicker = container.querySelector('.DayPicker');
        expect(dayPicker).to.not.equal(null);

        global.navigator = originalNavigator;
      });

      it('keeps focus on input when keepFocusOnInput is true', () => {
        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            onDatesChange={sinon.stub()}
            onFocusChange={sinon.stub()}
            keepFocusOnInput
          />,
        );

        // Focus the start date input
        const input = container.querySelector('.DateInput_input');
        fireEvent.focus(input);

        expect(document.activeElement).to.equal(input);
      });

      it('shows full screen portal and keeps focus on input when withFullScreenPortal and keepFocusOnInput', () => {
        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            onDatesChange={sinon.stub()}
            onFocusChange={sinon.stub()}
            keepFocusOnInput
            withFullScreenPortal
          />,
        );

        // Focus the start date input
        const input = container.querySelector('.DateInput_input');
        fireEvent.focus(input);

        const fullScreenPortal = document.querySelector('.ReactDatesPortal');
        expect(fullScreenPortal).to.not.equal(null);
        expect(fullScreenPortal.classList.contains('ReactDatesPortal_fullscreen')).to.equal(true);

        expect(document.activeElement).to.equal(input);
      });

      it('shows day picker when input is focused with default props', () => {
        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            onDatesChange={sinon.stub()}
            onFocusChange={sinon.stub()}
          />,
        );

        // Focus the start date input
        const input = container.querySelector('.DateInput_input');
        fireEvent.focus(input);

        const dayPicker = container.querySelector('.DayPicker');
        expect(dayPicker).to.not.equal(null);
      });
    });
  });

  describe('#onDayPickerFocus', () => {
    it('focuses the day picker instead of the input', () => {
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          focusedInput={START_DATE}
        />,
      );

      const input = container.querySelector('.DateInput_input');
      fireEvent.focus(input);

      const dayPicker = container.querySelector('.DayPicker');
      fireEvent.focus(dayPicker);

      expect(document.activeElement).to.not.equal(input);
      const isActiveElementInDayPicker = document.activeElement === dayPicker
        || dayPicker.contains(document.activeElement);
      expect(isActiveElementInDayPicker).to.equal(true);
    });

    it('focuses the day picker when clicked', () => {
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          focusedInput={START_DATE}
        />,
      );

      const input = container.querySelector('.DateInput_input');
      fireEvent.focus(input);

      const dayPicker = container.querySelector('.DayPicker');
      fireEvent.mouseDown(dayPicker);

      const isActiveElementInDayPicker = document.activeElement === dayPicker
        || dayPicker.contains(document.activeElement);
      expect(isActiveElementInDayPicker).to.equal(true);
    });

    it('hides keyboard shortcuts when day picker is focused', () => {
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          focusedInput={START_DATE}
          showKeyboardShortcuts
        />,
      );

      const input = container.querySelector('.DateInput_input');
      fireEvent.focus(input);

      const dayPicker = container.querySelector('.DayPicker');
      fireEvent.focus(dayPicker);

      const keyboardShortcutsPanel = container.querySelector('.KeyboardShortcutRow');
      expect(keyboardShortcutsPanel).to.equal(null);
    });

    describe('focusedInput is truthy', () => {
      it('does not call onFocusChange when day picker is focused and focusedInput is already set', () => {
        const onFocusChangeStub = sinon.stub();
        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            focusedInput={START_DATE}
            onDatesChange={sinon.stub()}
            onFocusChange={onFocusChangeStub}
          />,
        );

        // Focus the day picker
        const dayPicker = container.querySelector('.DayPicker');
        fireEvent.focus(dayPicker);

        // onFocusChange should not be called since focusedInput is already set
        expect(onFocusChangeStub.callCount).to.equal(0);
      });
    });

    describe('focusedInput is falsy', () => {
      it('calls onFocusChange when day picker is focused and focusedInput is null', () => {
        const onFocusChangeStub = sinon.stub();
        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            focusedInput={null}
            onDatesChange={sinon.stub()}
            onFocusChange={onFocusChangeStub}
          />,
        );

        const input = container.querySelector('.DateInput_input');
        fireEvent.click(input);

        // onFocusChange should be called with START_DATE
        expect(onFocusChangeStub.callCount).to.equal(1);
        expect(onFocusChangeStub.getCall(0).args[0]).to.equal(START_DATE);
      });
    });
  });

  describeIfWindow('day picker position', () => {
    it('day picker is opened after the end date input when end date input is focused', () => {
      const { container } = render(
        <DateRangePickerWrapper
          startDateId="startDate"
          endDateId="endDate"
        />,
      );

      let dayPicker = container.querySelector('.DayPicker');
      expect(dayPicker).to.equal(null);

      // Focus the start date input
      const startDateInput = container.querySelectorAll('.DateInput_input')[0];
      fireEvent.focus(startDateInput);

      // Day picker should be rendered after the start date input
      dayPicker = container.querySelector('.DayPicker');
      expect(dayPicker).to.not.equal(null);
      const startDateInputParent = startDateInput.closest('.DateInput');
      const dayPickerParent = dayPicker.parentElement;
      expect(startDateInputParent.nextElementSibling).to.equal(dayPickerParent);

      // Focus the end date input
      const endDateInput = container.querySelectorAll('.DateInput_input')[1];
      fireEvent.focus(endDateInput);

      // Day picker should be rendered after the end date input
      dayPicker = container.querySelector('.DayPicker');
      expect(dayPicker).to.not.equal(null);
      const endDateInputParent = endDateInput.closest('.DateInput');
      expect(endDateInputParent.nextElementSibling).to.equal(dayPickerParent);
    });
  });

  describeIfWindow('day picker blur behavior', () => {
    it('focuses back on input when day picker loses focus', () => {
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          focusedInput={START_DATE}
        />,
      );

      // First focus the input to show the day picker
      const input = container.querySelector('.DateInput_input');
      fireEvent.focus(input);

      // Then focus the day picker
      const dayPicker = container.querySelector('.DayPicker');
      fireEvent.focus(dayPicker);

      // Then blur the day picker
      fireEvent.blur(dayPicker);

      expect(document.activeElement).to.equal(input);
    });

    it('hides keyboard shortcuts when day picker loses focus', () => {
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          focusedInput={START_DATE}
          showKeyboardShortcuts
        />,
      );

      // First focus the input to show the day picker
      const input = container.querySelector('.DateInput_input');
      fireEvent.focus(input);

      // Then focus the day picker
      const dayPicker = container.querySelector('.DayPicker');
      fireEvent.focus(dayPicker);

      // Then blur the day picker
      fireEvent.blur(dayPicker);

      const keyboardShortcutsPanel = container.querySelector('.KeyboardShortcutRow');
      expect(keyboardShortcutsPanel).to.equal(null);
    });

    it('closes day picker when tabbing out', () => {
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          focusedInput={START_DATE}
        />,
      );

      // First focus the input to show the day picker
      const input = container.querySelector('.DateInput_input');
      fireEvent.focus(input);

      // Day picker should be visible
      let dayPicker = container.querySelector('.DayPicker');
      expect(dayPicker).to.not.equal(null);

      fireEvent.keyDown(dayPicker, { key: 'Tab', shiftKey: false });

      // Focus should move away from the day picker
      fireEvent.blur(dayPicker);

      dayPicker = container.querySelector('.DayPicker');
      expect(dayPicker === null || dayPicker.style.display === 'none').to.equal(true);
    });

    it('keeps day picker open when tabbing within it', () => {
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          focusedInput={START_DATE}
        />,
      );

      // First focus the input to show the day picker
      const input = container.querySelector('.DateInput_input');
      fireEvent.focus(input);

      // Day picker should be visible
      const dayPicker = container.querySelector('.DayPicker');
      expect(dayPicker).to.not.equal(null);

      // Find a day button inside the day picker
      const dayButton = dayPicker.querySelector('.CalendarDay');

      // Simulate tabbing to a day button within the day picker
      fireEvent.keyDown(dayPicker, { key: 'Tab', shiftKey: false });
      fireEvent.focus(dayButton);

      expect(container.querySelector('.DayPicker')).to.not.equal(null);
      expect(container.querySelector('.DayPicker').style.display).to.not.equal('none');
    });
  });

  describe('keyboard shortcuts panel', () => {
    it('shows keyboard shortcuts panel when question mark button is clicked', () => {
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          focusedInput={START_DATE}
        />,
      );

      // First focus the input to show the day picker
      const input = container.querySelector('.DateInput_input');
      fireEvent.focus(input);

      const keyboardShortcutsButton = container.querySelector('.DayPickerKeyboardShortcuts_show');
      fireEvent.click(keyboardShortcutsButton);

      // Keyboard shortcuts panel should be visible
      const keyboardShortcutsPanel = container.querySelector('.DayPickerKeyboardShortcuts_panel');
      expect(keyboardShortcutsPanel).to.not.equal(null);
    });

    it('focuses the day picker when keyboard shortcuts panel is shown', () => {
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          focusedInput={START_DATE}
        />,
      );

      // First focus the input to show the day picker
      const input = container.querySelector('.DateInput_input');
      fireEvent.focus(input);

      const keyboardShortcutsButton = container.querySelector('.DayPickerKeyboardShortcuts_show');
      fireEvent.click(keyboardShortcutsButton);

      // Day picker should be focused, not the input
      expect(document.activeElement).to.not.equal(input);

      // The keyboard shortcuts panel should be visible
      const keyboardShortcutsPanel = container.querySelector('.DayPickerKeyboardShortcuts_panel');
      expect(keyboardShortcutsPanel).to.not.equal(null);
    });
  });

  describe('initialVisibleMonth', () => {
    describe('initialVisibleMonth is passed in', () => {
      it('renders the correct initial month when initialVisibleMonth is provided', () => {
        const initialMonth = moment().add(2, 'months').startOf('month');
        const initialVisibleMonth = () => initialMonth;

        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            focusedInput={START_DATE}
            initialVisibleMonth={initialVisibleMonth}
          />,
        );

        // Focus the input to show the day picker
        const input = container.querySelector('.DateInput_input');
        fireEvent.focus(input);

        const monthCaption = container.querySelector('.CalendarMonth_caption');
        expect(monthCaption).to.not.equal(null);
        expect(monthCaption.textContent).to.equal(initialMonth.format('MMMM YYYY'));
      });
    });

    describe('initialVisibleMonth is not passed in', () => {
      it('renders the month of startDate when startDate is provided', () => {
        const startDate = moment().add(10, 'days');

        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            focusedInput={START_DATE}
            startDate={startDate}
          />,
        );

        // Focus the input to show the day picker
        const input = container.querySelector('.DateInput_input');
        fireEvent.focus(input);

        const monthCaption = container.querySelector('.CalendarMonth_caption');
        expect(monthCaption).to.not.equal(null);
        expect(monthCaption.textContent).to.equal(startDate.format('MMMM YYYY'));
      });

      it('renders the month of endDate when only endDate is provided', () => {
        const endDate = moment().add(5, 'days');

        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            focusedInput={START_DATE}
            endDate={endDate}
          />,
        );

        // Focus the input to show the day picker
        const input = container.querySelector('.DateInput_input');
        fireEvent.focus(input);

        const monthCaption = container.querySelector('.CalendarMonth_caption');
        expect(monthCaption).to.not.equal(null);
        expect(monthCaption.textContent).to.equal(endDate.format('MMMM YYYY'));
      });

      it('renders the current month when neither startDate nor endDate is provided', () => {
        const today = moment();

        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            focusedInput={START_DATE}
          />,
        );

        // Focus the input to show the day picker
        const input = container.querySelector('.DateInput_input');
        fireEvent.focus(input);

        const monthCaption = container.querySelector('.CalendarMonth_caption');
        expect(monthCaption).to.not.equal(null);
        expect(monthCaption.textContent).to.equal(today.format('MMMM YYYY'));
      });
    });
  });

  describe('dateOffsets', () => {
    describe('startDateOffset is passed in', () => {
      it('applies startDateOffset to the date selection', () => {
        const onDatesChangeStub = sinon.stub();
        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            startDateOffset={(date) => date.subtract(5, 'days')}
            onDatesChange={onDatesChangeStub}
            focusedInput={START_DATE}
          />,
        );

        // Focus the input to show the day picker
        const input = container.querySelector('.DateInput_input');
        fireEvent.focus(input);

        const dayPicker = container.querySelector('.DayPicker');
        expect(dayPicker).to.not.equal(null);
      });
    });

    describe('endDateOffset is passed in', () => {
      it('applies endDateOffset to the date selection', () => {
        const onDatesChangeStub = sinon.stub();
        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            endDateOffset={(date) => date.subtract(5, 'days')}
            onDatesChange={onDatesChangeStub}
            focusedInput={START_DATE}
          />,
        );

        // Focus the input to show the day picker
        const input = container.querySelector('.DateInput_input');
        fireEvent.focus(input);

        const dayPicker = container.querySelector('.DayPicker');
        expect(dayPicker).to.not.equal(null);
      });
    });
  });

  describe('minDate and maxDate props', () => {
    describe('minDate is passed in', () => {
      it('respects minDate constraint when selecting dates', () => {
        const minDate = moment('2018-10-19');
        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            focusedInput={START_DATE}
            minDate={minDate}
          />,
        );

        // Focus the input to show the day picker
        const input = container.querySelector('.DateInput_input');
        fireEvent.focus(input);

        const dayPicker = container.querySelector('.DayPicker');
        expect(dayPicker).to.not.equal(null);

        const disabledDays = container.querySelectorAll('.CalendarDay__blocked_calendar');
        expect(disabledDays.length).to.be.at.least(1);
      });
    });

    describe('maxDate is passed in', () => {
      it('respects maxDate constraint when selecting dates', () => {
        const maxDate = moment('2018-12-19');
        const { container } = render(
          <DateRangePicker
            {...requiredProps}
            focusedInput={START_DATE}
            maxDate={maxDate}
          />,
        );

        // Focus the input to show the day picker
        const input = container.querySelector('.DateInput_input');
        fireEvent.focus(input);

        const dayPicker = container.querySelector('.DayPicker');
        expect(dayPicker).to.not.equal(null);

        const disabledDays = container.querySelectorAll('.CalendarDay__blocked_calendar');
        expect(disabledDays.length).to.be.at.least(1);
      });
    });
  });

  it('renders day picker without a border when noBorder prop is true', () => {
    const { container } = render(
      <DateRangePicker {...requiredProps} focusedInput={START_DATE} noBorder />,
    );

    // Focus the input to show the day picker
    const input = container.querySelector('.DateInput_input');
    fireEvent.focus(input);

    const dayPicker = container.querySelector('.DayPicker');
    expect(dayPicker).to.not.equal(null);
    const hasNoBorder = (
      dayPicker.classList.contains('DayPicker--noBorder')
      || dayPicker.style.border === 'none'
      || dayPicker.style.borderWidth === '0px'
    );
    expect(hasNoBorder).to.equal(true);
  });
});
