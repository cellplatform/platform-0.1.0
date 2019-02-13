import * as moment from 'moment';
import * as day from 'dayjs';

/**
 * Retrieves a unix timestamp.
 *
 * See:
 *    https://coderwall.com/p/rbfl6g/how-to-get-the-correct-unix-timestamp-from-any-date-in-javascript
 *
 */
export function toTimestamp(date?: Date) {
  return day(date || new Date()).unix();
}

/**
 * Converts a timestamp into a Date.
 */
export function fromTimestamp(timestamp: number) {
  return moment
    .unix(timestamp)
    .utc()
    .toDate();
}
