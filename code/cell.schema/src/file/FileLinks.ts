import { t, queryString } from '../common';
import { Uri } from '../Uri';
import { Links } from '../Link';

const fs = Links.create('fs');

/**
 * Helpers for operating on [file] links.
 */
export class FileLinks {
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

  public static parseLink(linkValue: string) {
    if (!FileLinks.is.fileValue(linkValue)) {
      throw new Error(`Cannot parse '${linkValue}' as it is not a file URI.`);
    }

    type Q = { hash?: string; status?: 'uploading' };
    const res = fs.parseValue<t.IFileUri, Q>(linkValue);
    const { uri, query, value } = res;
    const { hash, status } = query;
    return {
      value,
      uri,
      hash,
      status,
      toString(args: { hash?: string | null; status?: string | null } = {}) {
        const query = queryString
          .build({ allowNil: false })
          .add('status', args.status === null ? null : args.status || status)
          .add('hash', args.hash === null ? null : args.hash || hash)
          .toString();
        return `${uri.toString()}${query}`;
      },
    };
  }

  /**
   * Converts a links URI map into a list of parsed file refs.
   */
  public static toList(links: t.IUriMap = {}) {
    return fs.toList(links).map(({ key, value }) => toFileLink(key, value));
  }

  /**
   * Lookup a file on the given links.
   */
  public static find(links: t.IUriMap = {}) {
    return {
      byName(path?: string) {
        path = (path || '').trim().replace(/^\/*/, '');
        const match = Object.keys(links)
          .map(key => ({ key, value: links[key] }))
          .filter(({ key }) => fs.isKey(key))
          .find(({ key }) => FileLinks.parseKey(key).path === path);
        return match ? toFileLink(match.key, match.value) : undefined;
      },
    };
  }
}

/**
 * [Helpers]
 */

function toFileLink(key: string, value: string): t.IFileLink {
  const { dir, path, name: filename, ext } = FileLinks.parseKey(key);
  const { uri, hash, status } = FileLinks.parseLink(value);
  const { ns, file: id } = uri;
  // uri.
  const file = { ns, id, path, dir, filename, ext };
  return { uri: uri.toString(), key, value, hash, status, file };
}
