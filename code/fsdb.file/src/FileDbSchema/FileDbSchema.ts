import { t, fs } from '../common';

/**
 * A schema for mapping keys to file locations.
 */
export class FileDbSchema {
  public static DEFAULT: t.IFileDbSchema = { paths: {} };
  private constructor() {
    // No-op.
  }

  /**
   * [Methods]
   */
  public static path(args: { schema: t.IFileDbSchema; dir: string; key: string }) {
    const { schema, dir } = args;
    let key = FileDbSchema.formatKey(args.key);
    const mapping = FileDbSchema.mapping({ schema, key });
    key = mapping ? FileDbSchema.formatKey(mapping.file) : key;
    return fs.join(dir, `${key}.json`);
  }

  public static mapping(args: { schema: t.IFileDbSchema; key: string }) {
    const { schema } = args;
    const key = FileDbSchema.formatKey(args.key);
    return Object.keys(schema.paths)
      .map(key => ({ key, file: schema.paths[key].file }))
      .find(item => key.startsWith(item.key));
  }

  public static formatKey(key: string) {
    return (key || '')
      .toString()
      .trim()
      .replace(/\/$/, '') // NB: trailing "/"
      .replace(/\.json$/, '');
  }
}
