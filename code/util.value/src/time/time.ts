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
  get now() {
    return utc();
  },
  duration(msecs: number, options: { round?: number } = {}) {
    const { round } = options;
    return Duration.create({ msecs, round });
  },
};
