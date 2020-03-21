import { ERROR, t, isHttp } from '../common';
import { FileLinks } from './FileLinks';
import { Uri } from '../Uri';

type IFileSchemaArgs = { nsPath: string; fileid: string; uri: string };

/**
 * Schema for a file.
 */
export class FileSchema {
  public static links = FileLinks;
  public static ERROR = ERROR;

  public readonly type: t.SchemaFileType = 'FILE';
  public readonly fileid: string;
  public readonly path: string;
  public readonly uri: string;

  /**
   * [Lifecycle]
   */
  public static create = (args: IFileSchemaArgs) => new FileSchema(args);
  private constructor(args: IFileSchemaArgs) {
    this.fileid = args.fileid;
    this.path = `${args.nsPath}/${this.type}/${this.fileid}`;
    this.uri = args.uri;
  }

  /**
   * Generate file URI from a path.
   */
  public static uri(args: { path: string }) {
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
  }

  /**
   * Creates a fully-qualified file path (URI).
   */
  public static toFileLocation(input: string = '') {
    input = input.trim();
    return isHttp(input) ? input : `file://${input}`;
  }
}
