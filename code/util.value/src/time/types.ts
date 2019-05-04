import { Dayjs, ConfigType } from 'dayjs';

export type TimeDelay = (msecs: number, callback?: () => void) => Promise<{}>;
export type TimeWait = (msecs: number) => Promise<{}>;
export type TimeElapsed = (from: Date) => IDuration;
export type DayFactory = (config?: ConfigType) => Dayjs;

export type ITime = {
  delay: TimeDelay;
  wait: TimeWait;
  timer: (start?: Date) => ITimer;
  toTimestamp: (date?: Date) => number;
  fromTimestamp: (timestamp: number) => Date;
  elapsed: TimeElapsed;
  day: DayFactory;
};

export type IDuration = {
  msec: number;
  sec: number;
  min: number;
  hour: number;
  day: number;
  toString(unit?: TimerUnit): string;
};

export type TimerUnit = 'msec' | 'ms' | 'sec' | 's' | 'min' | 'm' | 'hour' | 'h' | 'day' | 'd';

export type ITimer = {
  startedAt: Date;
  reset: () => ITimer;
  elapsed: IDuration;
};
