import { t, queryString } from '../common';
import { Uri } from '../Uri';
import { Links } from '../Links';

const prefix = 'fs';
const fs = Links.create(prefix);

/**
 * Helpers for operating on [file] links.
 */
export class FileLinks {
  public static prefix = prefix;

  public static is = {
    fileKey(input?: string) {
      return fs.isKey(input);
    },
    fileValue(input?: string) {
      input = (input || '').toString().trim();
      return Uri.is.file(input);
    },
    fileUploading(value?: string) {
      if (!FileLinks.is.fileValue(value)) {
        return false;
      }
      value = (value || '').toString().trim();
      const query = (value.split('?')[1] || '').toLowerCase();
      return query.includes('status=uploading');
    },
  };

  public static total(links: t.IUriMap = {}) {
    return fs.total(links);
  }

  public static toKey(filename: string) {
    return fs.toKey(filename);
  }

  public static parseKey(linkKey: string) {
    return fs.parseKey(linkKey);
  }

  public static parseValue(linkValue: string) {
    if (!FileLinks.is.fileValue(linkValue)) {
      throw new Error(`Cannot parse '${linkValue}' as it is not a file URI.`);
    }
    const res = fs.parseValue<t.IFileUri, t.IFileLinkQuery>(linkValue);
    const toString: t.FileLinkToString = (options = {}) => {
      const { status, hash } = res.query;
      const query = queryString
        .build({ allowNil: false })
        .add('status', options.status === null ? null : options.status || status)
        .add('hash', options.hash === null ? null : options.hash || hash)
        .toString();
      return `${res.uri.toString()}${query}`;
    };
    return { ...res, toString };
  }

  public static parse(linkKey: string, linkValue: string): t.IFileLink {
    const key = FileLinks.parseKey(linkKey);
    const value = FileLinks.parseValue(linkValue);
    const toString = value.toString;
    return { ...key, ...value, toString };
  }

  /**
   * Converts a links URI map into a list of parsed file refs.
   */
  public static toList(links: t.IUriMap = {}) {
    return fs.toList(links).map(({ key, value }) => FileLinks.parse(key, value));
  }

  /**
   * Lookup a file on the given links.
   */
  public static find(links: t.IUriMap = {}) {
    return {
      byName(path?: string) {
        const match = fs.find(links).byName(path);
        return match ? FileLinks.parse(match.key, match.value) : undefined;
      },
    };
  }
}
