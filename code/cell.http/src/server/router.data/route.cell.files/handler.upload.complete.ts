import { Schema, t } from '../common';

export async function uploadCellFilesComplete(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  host: string;
  changes?: boolean;
}) {
  const { db, fs, cellUri, host } = args;
  const parts = Schema.uri.parse<t.ICellUri>(cellUri).parts;
  const cellKey = parts.key;
  const ns = parts.ns;

  /**
   * TODO 🐷
   * Update file links.
   */

  const res = {};

  // Finish up.
  return { status: 200, data: res };
}
