export type IDuration = {
  isValid: boolean;
  msec: number;
  sec: number;
  min: number;
  hour: number;
  day: number;
  toString(unit?: TimeUnit | { unit?: TimeUnit; round?: number }): string;
};

export type TimeUnit = 'msec' | 'ms' | 'sec' | 's' | 'min' | 'm' | 'hour' | 'h' | 'day' | 'd';
