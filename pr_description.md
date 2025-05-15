# Update React Lifecycle Methods to Use UNSAFE_ Prefix

This PR addresses the React lifecycle method deprecation warnings by updating all deprecated methods to use the UNSAFE_ prefix as recommended by the React team.

## Changes Made
- Updated `componentWillReceiveProps` to `UNSAFE_componentWillReceiveProps` in:
  - CalendarMonth.jsx
  - DayPickerKeyboardShortcuts.jsx
  - CalendarMonthGrid.jsx
  - DayPicker.jsx
  - DayPickerRangeController.jsx
  - DayPickerSingleDateController.jsx
  - DateInput.jsx
- Updated `componentWillUpdate` to `UNSAFE_componentWillUpdate` in:
  - DayPicker.jsx
  - DayPickerSingleDateController.jsx

## Testing
- Verified that the lint command no longer shows warnings about deprecated lifecycle methods
- Note: There are still 2 accessibility errors unrelated to this change

Link to Devin run: https://app.devin.ai/sessions/8a6d9aedbba04fb4b286e91071dcf39d
Requested by: Shawn Azman
