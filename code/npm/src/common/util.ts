/**
 * Parses out the ^ or ~ prefix of a version.
 */
export function parseVersionPrefix(version: string) {
  version = (version || '').trim();
  let prefix = '';
  if (version.startsWith('~') || version.startsWith('^')) {
    prefix = version[0];
    version = version.substring(1);
  }
  return { prefix, version };
}
