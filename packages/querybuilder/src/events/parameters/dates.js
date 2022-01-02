import { CONSTANTS } from '@videre/database';

const validateDate = date => (date?.split(/(?:\/|-)+/) || []).length == 3;

const formatDate = date => new Intl.DateTimeFormat('en-US').format(date);

// Format prettified dates from query string.
export const parseDateRange = (min_date, max_date, offset) => {
  const offset_ms = (offset ? parseInt(offset) : 0) * CONSTANTS.day;
  return {
    min_date: validateDate(min_date)
      ? formatDate(new Date(min_date).getTime() + offset_ms)
      : undefined,
    max_date: validateDate(max_date)
      ? formatDate(new Date(max_date).getTime() - offset_ms)
      : !isNaN(offset)
        ? formatDate(new Date().getTime() - offset_ms)
        : undefined
  };
}