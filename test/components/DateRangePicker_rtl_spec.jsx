import React from 'react';
import moment from 'moment';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DateRangePicker from '../../src/components/DateRangePicker';

import {
  HORIZONTAL_ORIENTATION,
  START_DATE,
} from '../../src/constants';

import describeIfWindow from '../_helpers/describeIfWindow';
import '../_helpers/rtlSetup';

function DateRangePickerWrapper(props) {
  const [focusedInput, setFocusedInput] = React.useState(null);
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);

  const onDatesChange = React.useCallback(({ startDate: newStartDate, endDate: newEndDate }) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);

  const onFocusChange = React.useCallback((newFocusedInput) => {
    setFocusedInput(newFocusedInput);
  }, []);

  return (
    <div>
      <DateRangePicker
        {...props}
        onDatesChange={onDatesChange}
        onFocusChange={onFocusChange}
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

const requiredProps = {
  onDatesChange: () => {},
  onFocusChange: () => {},
  startDateId: 'startDate',
  endDateId: 'endDate',
};

describe('DateRangePicker', () => {
  describe('#render()', () => {
    it('renders date inputs', () => {
      render(<DateRangePicker {...requiredProps} focusedInput={START_DATE} />);
      expect(screen.getAllByRole('textbox')).to.have.lengthOf(2);
    });

    it('renders calendar when focused', () => {
      render(<DateRangePicker {...requiredProps} focusedInput={START_DATE} />);
      expect(screen.getByRole('application')).to.not.equal(null);
    });

    describe('props.orientation === HORIZONTAL_ORIENTATION', () => {
      it('renders with two months visible', () => {
        render(
          <DateRangePicker
            {...requiredProps}
            orientation={HORIZONTAL_ORIENTATION}
            focusedInput={START_DATE}
          />,
        );
        const calendarEl = screen.getByRole('application');
        const monthElements = within(calendarEl).getAllByRole('table');
        expect(monthElements).to.have.lengthOf(2);
      });
    });

    describe('props.withPortal is truthy', () => {
      describe('<Portal />', () => {
        it('is rendered when focusedInput is not null', () => {
          render(
            <DateRangePicker
              {...requiredProps}
              withPortal
              focusedInput={START_DATE}
            />,
          );
          expect(document.querySelector('[data-react-portal]')).to.not.equal(null);
        });

        it('is not rendered if props.focusedInput === null', () => {
          render(
            <DateRangePicker {...requiredProps} focusedInput={null} withPortal />,
          );
          expect(document.querySelector('[data-react-portal]')).to.equal(null);
        });
      });
    });

    describe('props.withFullScreenPortal is truthy', () => {
      it('renders the calendar in a portal when focusedInput is not null', () => {
        render(
          <DateRangePicker {...requiredProps} withFullScreenPortal focusedInput={START_DATE} />,
        );
        expect(document.querySelector('[data-react-portal]')).to.not.equal(null);
      });

      it('does not render the calendar when focusedInput is null', () => {
        render(
          <DateRangePicker
            {...requiredProps}
            focusedInput={null}
            withFullScreenPortal
          />,
        );
        expect(document.querySelector('[data-react-portal]')).to.equal(null);
      });
    });

    describe('props.isDayBlocked is defined', () => {
      it('should render with isDayBlocked function', () => {
        const isDayBlocked = sinon.stub();
        render(
          <DateRangePicker
            {...requiredProps}
            isDayBlocked={isDayBlocked}
            focusedInput={START_DATE}
          />,
        );
        expect(screen.getByRole('application')).to.not.equal(null);
      });
    });

    describe('props.appendToBody', () => {
      it('renders calendar in a portal', () => {
        render(
          <DateRangePicker {...requiredProps} appendToBody focusedInput={START_DATE} />,
        );
        expect(document.querySelector('[data-react-portal]')).to.not.equal(null);
      });

      describeIfWindow('mounted', () => {
        it('handles outside clicks', async () => {
          const onCloseStub = sinon.stub();
          const user = userEvent.setup();

          render(
            <DateRangePicker
              {...requiredProps}
              appendToBody
              focusedInput={START_DATE}
              onClose={onCloseStub}
            />,
          );

          await user.click(document.body);
          expect(onCloseStub.callCount).to.equal(1);
        });
      });
    });

    describe('props.focusedInput', () => {
      it('renders calendar when focusedInput is not null', () => {
        render(
          <DateRangePicker {...requiredProps} focusedInput={START_DATE} />,
        );
        expect(screen.getByRole('application')).to.not.equal(null);
      });

      it('does not render calendar when focusedInput is null', () => {
        render(
          <DateRangePicker {...requiredProps} focusedInput={null} />,
        );
        expect(screen.queryByRole('application')).to.equal(null);
      });
    });
  });

  describe('#onOutsideClick', () => {
    it('calls onFocusChange with null when calendar is open', async () => {
      const onFocusChangeStub = sinon.stub();
      const user = userEvent.setup();

      render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={START_DATE}
          onFocusChange={onFocusChangeStub}
        />,
      );

      await user.click(document.body);
      expect(onFocusChangeStub.callCount).to.equal(1);
      expect(onFocusChangeStub.getCall(0).args[0]).to.equal(null);
    });

    it('calls onClose with startDate and endDate when calendar is open', async () => {
      const startDate = moment();
      const endDate = startDate.clone().add(1, 'days');
      const onCloseStub = sinon.stub();
      const user = userEvent.setup();

      render(
        <DateRangePicker
          {...requiredProps}
          startDate={startDate}
          endDate={endDate}
          focusedInput={START_DATE}
          onClose={onCloseStub}
          onFocusChange={() => {}}
        />,
      );

      await user.click(document.body);
      expect(onCloseStub.callCount).to.equal(1);
      const args = onCloseStub.getCall(0).args[0];
      expect(args.startDate).to.equal(startDate);
      expect(args.endDate).to.equal(endDate);
    });
  });

  describe('#onDateRangePickerInputFocus', () => {
    it('calls onFocusChange', async () => {
      const onFocusChangeStub = sinon.stub();
      const user = userEvent.setup();

      render(
        <DateRangePicker
          {...requiredProps}
          onDatesChange={sinon.stub()}
          onFocusChange={onFocusChangeStub}
        />,
      );

      const startDateInput = screen.getAllByRole('textbox')[0];
      await user.click(startDateInput);
      expect(onFocusChangeStub.callCount).to.equal(1);
    });

    it('calls onFocusChange with the correct argument', async () => {
      const onFocusChangeStub = sinon.stub();
      const user = userEvent.setup();

      render(
        <DateRangePicker
          {...requiredProps}
          onDatesChange={sinon.stub()}
          onFocusChange={onFocusChangeStub}
        />,
      );

      const startDateInput = screen.getAllByRole('textbox')[0];
      await user.click(startDateInput);
      expect(onFocusChangeStub.getCall(0).args[0]).to.equal(START_DATE);
    });
  });

  describeIfWindow('day picker position', () => {
    it('day picker is opened after the end date input when end date input is focused', async () => {
      const user = userEvent.setup();
      render(
        <DateRangePickerWrapper
          startDateId="startDate"
          endDateId="endDate"
        />,
      );

      const [startInput, endInput] = screen.getAllByRole('textbox');
      expect(screen.queryByRole('application')).to.equal(null);

      await user.click(startInput);
      expect(screen.getByRole('application')).to.not.equal(null);

      await user.click(endInput);
      expect(screen.getByRole('application')).to.not.equal(null);
    });
  });

  describe('keyboard shortcuts', () => {
    it('shows keyboard shortcuts when ? key is pressed', async () => {
      const user = userEvent.setup();

      render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={START_DATE}
        />,
      );

      await user.keyboard('?');
      expect(screen.getByText(/keyboard shortcuts/i)).to.not.equal(null);
    });
  });

  describe('initialVisibleMonth', () => {
    it('uses initialVisibleMonth prop when provided', () => {
      const initialVisibleMonth = () => moment('2019-01-01');

      render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={START_DATE}
          initialVisibleMonth={initialVisibleMonth}
        />,
      );

      expect(screen.getByText('January 2019')).to.not.equal(null);
    });

    it('uses startDate as initial month when provided', () => {
      const startDate = moment('2020-02-15');

      render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={START_DATE}
          startDate={startDate}
        />,
      );

      expect(screen.getByText('February 2020')).to.not.equal(null);
    });

    it('uses endDate as initial month when startDate is not provided', () => {
      const endDate = moment('2021-03-15');

      render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={START_DATE}
          endDate={endDate}
        />,
      );

      expect(screen.getByText('March 2021')).to.not.equal(null);
    });
  });

  describe('dateOffsets', () => {
    it('applies startDateOffset correctly', () => {
      render(
        <DateRangePicker
          {...requiredProps}
          startDateOffset={(date) => date.subtract(5, 'days')}
          focusedInput={START_DATE}
        />,
      );

      expect(screen.getByRole('application')).to.not.equal(null);
    });

    it('applies endDateOffset correctly', () => {
      render(
        <DateRangePicker
          {...requiredProps}
          endDateOffset={(date) => date.add(5, 'days')}
          focusedInput={START_DATE}
        />,
      );

      expect(screen.getByRole('application')).to.not.equal(null);
    });
  });

  describe('minDate and maxDate props', () => {
    it('respects minDate constraint', () => {
      const minDate = moment().add(1, 'month').startOf('month');

      render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={START_DATE}
          minDate={minDate}
        />,
      );

      expect(screen.getByRole('application')).to.not.equal(null);
    });

    it('respects maxDate constraint', () => {
      const maxDate = moment().add(1, 'month').endOf('month');

      render(
        <DateRangePicker
          {...requiredProps}
          focusedInput={START_DATE}
          maxDate={maxDate}
        />,
      );

      expect(screen.getByRole('application')).to.not.equal(null);
    });
  });

  it('passes noBorder prop to the calendar', () => {
    render(
      <DateRangePicker {...requiredProps} focusedInput={START_DATE} noBorder />,
    );

    expect(screen.getByRole('application')).to.not.equal(null);
  });
});
