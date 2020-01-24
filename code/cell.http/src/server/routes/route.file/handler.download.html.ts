import { ERROR, t, util } from '../common';


export const downloadHtmlFile = async (args: {
  host: string;
  db: t.IDb;
  fs: t.IFileSystem;
  fileUri: string;
  filename?: string;
  matchHash?: string;
  expires?: string;
}) => {
  console.log('download html');
};
