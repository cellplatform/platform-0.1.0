import { ERROR, t, isHttp } from '../common';
import { FileLinks } from './FileLinks';
import { FilePath } from './FilePath';
import { Uri } from '../Uri';

/**
 * Schema for a file.
 */
export const FileSchema = {
  ERROR,
  Links: FileLinks,
  Path: FilePath,
  type: 'FILE' as t.SchemaFileType,

  /**
   * Object representation of a file.
   */
  toObject(args: { nsPath: string; fileid: string; uri: string }) {
    return {
      fileid: args.fileid,
      uri: args.uri,
      path: `${args.nsPath}/${FileSchema.type}/${args.fileid}`,
    };
  },

  /**
   * Generate file URI from a path.
   */
  uri(args: { path: string }) {
    const path = (args.path || '').trim();
    const parts = path.split('/');

    if (parts[0] !== 'NS') {
      throw new Error(`The DB path does not start with 'NS/'. Given '${path}'.`);
    }
    if (parts[2] !== 'FILE') {
      throw new Error(`The DB path does not contain '/FILE/'. Given '${path}'.`);
    }

    const ns = parts[1];
    const file = parts[3];
    return Uri.create.file(ns, file);
  },

  /**
   * Creates a fully-qualified file path (URI).
   */
  toFileLocation(input = '') {
    input = input.trim();
    return isHttp(input) ? input : `file://${input}`;
  },
};
