export type IDuration = {
  msec: number;
  sec: number;
  min: number;
  hour: number;
  day: number;
  toString(unit?: TimeUnit): string;
};

export type TimeUnit = 'msec' | 'ms' | 'sec' | 's' | 'min' | 'm' | 'hour' | 'h' | 'day' | 'd';
