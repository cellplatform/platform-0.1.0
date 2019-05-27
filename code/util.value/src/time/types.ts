import { Dayjs, ConfigType } from 'dayjs';

export type TimeDelay = (msecs: number, callback?: () => void) => Promise<{}>;
export type TimeWait = (msecs: number) => Promise<{}>;
export type TimeElapsed = (from: Date) => IDuration;
export type DayFactory = (config?: ConfigType) => Dayjs;

export type ITime = {
  delay: TimeDelay;
  wait: TimeWait;
  elapsed: TimeElapsed;
  day: DayFactory;
  now: IDate;
  utc(input?: Date | number): IDate;
  timer(start?: Date, options?: { round?: number }): ITimer;
  toTimestamp(date?: Date): number;
  fromTimestamp(timestamp: number): Date;
};

export type IDate = {
  date: Date;
  timestamp: number;
  unix: number;
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
