import { time } from './libs';

export function isOK(status: number) {
  return (status.toString() || '').startsWith('2');
}

export function formatETag(value?: string) {
  return value ? value.replace(/^"/, '').replace(/"$/, '') : '';
}

export function formatTimestamp(input?: string) {
  return input ? time.utc(new Date(input)).timestamp : -1;
}

export function formatBucket(input?: string) {
  return (input || '').trim().replace(/^\.*/, '').replace(/\.*$/, '');
}

export function formatKeyPath(input?: string) {
  return (input || '').trim().replace(/^\/*/, '');
}
