import { Dayjs, ConfigType } from 'dayjs';

export type TimeDelay<T = any> = (msecs: number, callback?: () => T) => TimeDelayPromise<T>;
export type TimeDelayPromise<T = any> = Promise<T> & {
  id: NodeJS.Timeout;
  isCancelled: boolean;
  cancel(): void;
  result: T | undefined;
};

export type TimeWait = (msecs: number) => Promise<{}>;
export type TimeElapsed = (
  from: DateInput,
  options?: { to?: DateInput; round?: number },
) => IDuration;
export type DayFactory = (config?: ConfigType) => Dayjs;

export type DateInput = number | string | Date | Dayjs;

export type ITime = {
  delay: TimeDelay;
  wait: TimeWait;
  elapsed: TimeElapsed;
  day: DayFactory;
  now: IDate;
  utc(input?: Date | number): IDate;
  timer(start?: Date, options?: { round?: number }): ITimer;
};

export type IDate = {
  date: Date;
  timestamp: number;
  unix: number;
  format(template?: string): string;
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
