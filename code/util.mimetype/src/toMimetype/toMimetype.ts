/**
 * Convert a key-path into it's "content-type" (mimetype).
 * - https://en.wikipedia.org/wiki/Media_type
 */
export function toMimetype(key: string, defaultType: string = '') {
  key = (key || '').trim();

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
