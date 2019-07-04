import * as day from 'dayjs';
import * as t from './types';

/**
 * Helpers for working with
 */
export function utc(input?: t.DateInput) {
  const date = day(input);
  const res: t.IDate = {
    get date() {
      return date.toDate();
    },
    get timestamp() {
      return date.toDate().getTime();
    },
    get unix() {
      return date.unix();
    },
  };
  return res;
}
