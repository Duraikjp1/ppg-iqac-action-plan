import { isDateInActionPlanMonth } from './date.js';

export function validateForm(data) {
  const errors = [];

  if (!data.department) {
    errors.push('Please select a department.');
  }

  if (data.department === 'Other' && !data.otherDepartment) {
    errors.push('Please enter the Other Department / Club Name.');
  }

  if (!data.semester) {
    errors.push('Please select a semester.');
  }

  if (!data.events || data.events.length === 0) {
    errors.push('Please add at least one event.');
    return errors;
  }

  data.events.forEach((evt, i) => {
    const n = i + 1;
    if (!evt.tentativeDate) {
      errors.push(`Event ${n}: Please enter the tentative date.`);
    } else if (!isDateInActionPlanMonth(evt.tentativeDate)) {
      errors.push(`Event ${n}: The tentative date must be in the Action Plan Month.`);
    }
    if (!evt.nameOfEvent) {
      errors.push(`Event ${n}: Please enter the event name.`);
    }
    if (!evt.venue) {
      errors.push(`Event ${n}: Please enter the venue.`);
    }
    if (!evt.natureType) {
      errors.push(`Event ${n}: Please select the nature/type.`);
    }
    if (evt.natureType === 'Other' && !evt.otherNatureType) {
      errors.push(`Event ${n}: Please enter the Other Nature / Type.`);
    }
    if (!evt.mode) {
      errors.push(`Event ${n}: Please select the mode.`);
    }
    if (!evt.beneficiary) {
      errors.push(`Event ${n}: Please enter the beneficiary.`);
    }
  });

  return errors;
}
