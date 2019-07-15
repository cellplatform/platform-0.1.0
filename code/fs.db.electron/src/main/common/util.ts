import * as t from '../types';

/**
 * Parse a DB string determining which kind of database to use.
 */
export function parseDbPath(input?: string): { path: string; kind: t.DbKind } {
  const DEFAULT: t.DbKind = 'FS';
  let path = (input || '').trim();

  const index = path.indexOf(':');
  const prefix = index > -1 ? path.substring(0, index) : '';
  path = prefix ? path.substring(prefix.length + 1) : path;

  const kind: t.DbKind = prefix === 'nedb' ? 'NEDB' : prefix === 'fs' ? 'FS' : DEFAULT;
  return { path, kind };
}
