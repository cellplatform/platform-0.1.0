import { time } from './libs';

export function formatETag(value?: string) {
  return value ? value.replace(/^\"/, '').replace(/\"$/, '') : undefined;
}

export function formatTimestamp(input?: string) {
  return input ? time.utc(new Date(input)).timestamp : -1;
}
