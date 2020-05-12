export function formatFilename(filename: string) {
  filename = (filename || '').trim().replace(/^ts\:filename\//, '');
  return `ts:filename/${filename}`;
}
