import * as day from 'dayjs';

import { delay, wait } from './delay';
import { elapsed, timer } from './timer';
import * as t from './types';
import { fromTimestamp, toTimestamp } from './util';

export { delay, wait, timer };
export * from './types';

export const time: t.ITime = {
  delay,
  wait,
  timer,
  elapsed,
  toTimestamp,
  fromTimestamp,
  day,
};
