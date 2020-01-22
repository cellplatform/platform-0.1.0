import { time } from './libs';

/**
 * Converts to seconds.
 */
export function toSeconds(input?: number | string, defaultSeconds?: number) {
  const done = (sec?: number) => {
    return sec === undefined ? undefined : sec < 0 ? undefined : sec;
  };
  if (input === undefined) {
    return done(defaultSeconds);
  } else {
    return typeof input === 'number' ? done(input) : done(time.duration(input).sec);
  }
}
