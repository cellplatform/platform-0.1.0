import { time } from './libs';
export * from './util.url';

export function isOK(status: number) {
  return (status.toString() || '').startsWith('2');
}

export function formatETag(value?: string) {
  return value ? value.replace(/^\"/, '').replace(/\"$/, '') : '';
}

export function formatTimestamp(input?: string) {
  return input ? time.utc(new Date(input)).timestamp : -1;
}

export function formatBucket(input?: string) {
  return (input || '')
    .trim()
    .replace(/^\.*/, '')
    .replace(/\.*$/, '');
}

export function formatKeyPath(input?: string) {
  return (input || '').trim().replace(/^\/*/, '');
}

/**
 * - https://en.wikipedia.org/wiki/Media_type
 */
export function toContentType(key: string, defaultType: string = '') {
  if (key.endsWith('.js')) {
    return 'application/javascript';
  }

  if (key.endsWith('.json')) {
    return 'application/json';
  }

  if (key.endsWith('.yaml') || key.endsWith('.yml')) {
    return 'text/plain';
  }

  if (key.endsWith('.txt')) {
    return 'text/plain';
  }

  if (key.endsWith('.html') || key.endsWith('.htm')) {
    return 'text/html';
  }

  if (key.endsWith('.css')) {
    return 'text/css';
  }

  if (key.endsWith('.png')) {
    return 'image/png';
  }

  if (key.endsWith('.jpg') || key.endsWith('.jpeg')) {
    return 'image/jpeg';
  }

  if (key.endsWith('.gif')) {
    return 'image/gif';
  }

  if (key.endsWith('.zip')) {
    return 'application/zip';
  }

  if (key.endsWith('.pdf')) {
    return 'application/pdf';
  }

  if (key.endsWith('.csv') || key.endsWith('.tsv')) {
    return 'text/csv';
  }

  return defaultType;
}
