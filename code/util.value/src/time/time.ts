import * as day from 'dayjs';

import { delay, wait } from './delay';
import { elapsed, timer } from './timer';
import { utc } from './utc';
import { ITime } from './types';
import { Duration } from './duration';

export * from './types';
export const time: ITime = {
  day,
  delay,
  wait,
  timer,
  elapsed,
  utc,
  get timezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },
  get now() {
    return utc();
  },
  duration(msec: number | string, options: { round?: number } = {}) {
    const { round } = options;
    return typeof msec === 'string'
      ? Duration.parse(msec, { round })
      : Duration.create(msec, { round });
  },
};
