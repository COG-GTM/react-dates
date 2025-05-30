import React from 'react';
import moment from 'moment';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Portal } from 'react-portal';

import DateRangePicker, { PureDateRangePicker } from '../../src/components/DateRangePicker';

import DateRangePickerInputController from '../../src/components/DateRangePickerInputController';
import DayPickerRangeController from '../../src/components/DayPickerRangeController';
import DayPicker from '../../src/components/DayPicker';

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
      expect(container.querySelector('DateRangePickerInputController')).to.exist;
    });

    it('renders <DayPickerRangeController />', () => {
      const { container } = render(
        <DateRangePicker {...requiredProps} focusedInput={START_DATE} />,
      );
      expect(container.querySelector('DayPickerRangeController')).to.exist;
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
          expect(document.querySelector('.DateRangePicker_portal')).to.exist;
        });

        it('is not rendered if props.focusedInput === null', () => {
          const { container } = render(
            <DateRangePicker {...requiredProps} focusedInput={null} withPortal />,
          );
          expect(document.querySelector('.DateRangePicker_portal')).to.not.exist;
        });
      });
    });

    describe('props.withFullScreenPortal is truthy', () => {
      it('does not render <DayPickerRangeController>', () => {
        const { container } = render(
          <DateRangePicker {...requiredProps} withFullScreenPortal />,
        );
        expect(container.querySelector('.DayPickerRangeController')).to.not.exist;
      });

      describe('<Portal />', () => {
        it('is rendered', () => {
          const { container } = render(
            <DateRangePicker {...requiredProps} withFullScreenPortal focusedInput={START_DATE} />,
          );
          expect(document.querySelector('.DateRangePicker_portal')).to.exist;
        });

        it('is not rendered if props.focusedInput === null', () => {
          const { container } = render(
            <DateRangePicker
              {...requiredProps}
              focusedInput={null}
              withFullScreenPortal
            />,
          );
          expect(document.querySelector('.DateRangePicker_portal')).to.not.exist;
        });
      });
    });

    describe('props.isDayBlocked is defined', () => {
      it('should pass props.isDayBlocked to <DateRangePickerInputController>', () => {
        const isDayBlocked = sinon.stub();

        const { container } = render(
          <DateRangePicker {...requiredProps} isDayBlocked={isDayBlocked} />,
        );

        expect(container.querySelector('DateRangePickerInputController')).to.exist;
      });

      it('is a noop when omitted', () => {
        const { container } = render(
          <DateRangePicker {...requiredProps} />,
        );
        expect(container.querySelector('DateRangePickerInputController')).to.exist;
      });
    });

    describe('props.appendToBody', () => {
      it('renders <DayPickerRangeController> inside <Portal>', () => {
        const { container } = render(
          <DateRangePicker {...requiredProps} appendToBody focusedInput={START_DATE} />,
        );

        const portal = document.querySelector('.DateRangePicker_portal');
        expect(portal).to.exist;
        expect(portal.querySelector('.DayPicker')).to.exist;
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
      });
    });

    describe('props.focusedInput', () => {
      it('renders <DayPickerRangeController> if props.focusedInput != null', () => {
        const { container } = render(
          <DateRangePicker {...requiredProps} focusedInput={START_DATE} />,
        );
        expect(container.querySelector('.DayPicker')).to.exist;
      });

      it('does not render <DayPickerRangeController> if props.focusedInput = null', () => {
        const { container } = render(
          <DateRangePicker {...requiredProps} focusedInput={null} />,
        );
        expect(container.querySelector('.DayPicker')).to.not.exist;
      });
    });
  });

  describe('#onOutsideClick', () => {
    it('does not call props.onFocusChange if props.focusedInput = null', () => {
      const onFocusChangeStub = sinon.stub();
      render(
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
      render(
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
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={START_DATE}
          onFocusChange={sinon.stub()}
          onDatesChange={sinon.stub()}
        />,
      );

      fireEvent.mouseDown(document.body);

      const input = container.querySelector('input');
      expect(document.activeElement).to.not.equal(input);
    });

    it('sets state.isDayPickerFocused to false', () => {
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={START_DATE}
          onFocusChange={sinon.stub()}
          onDatesChange={sinon.stub()}
        />,
      );

      fireEvent.mouseDown(document.body);

      const dayPicker = container.querySelector('.DayPicker');
      expect(document.activeElement).to.not.equal(dayPicker);
    });

    it('sets state.showKeyboardShortcuts to false', () => {
      const { container } = render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={START_DATE}
          onFocusChange={sinon.stub()}
          onDatesChange={sinon.stub()}
        />,
      );

      const keyboardShortcutsButton = container.querySelector('.DayPickerKeyboardShortcuts_show');
      if (keyboardShortcutsButton) {
        fireEvent.click(keyboardShortcutsButton);
      }

      fireEvent.mouseDown(document.body);

      expect(container.querySelector('.DayPickerKeyboardShortcuts_panel')).to.not.exist;
    });

    it('does not call props.onClose if props.focusedInput = null', () => {
      const onCloseStub = sinon.stub();
      render(
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
      const endDate = startDate.clone().add(1, 'days');
      const onCloseStub = sinon.stub();
      render(
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
});
