import { toMimetype } from '../toMimetype';

/**
 * Helpers for working with MIME types.
 */
export class Mime {
  public static toType = toMimetype;

  /**
   * Determine if the given MIME type represents a binary file.
   */
  public static isBinary(mimetype: string) {
    return !Mime.isText(mimetype) && !Mime.isJson(mimetype);
  }

  /**
   * Determine if the given MIME type represents a text file.
   */
  public static isText(mimetype: string) {
    return isIncluded(mimetype, ['text/', 'application/json', 'application/javascript']);
  }

  /**
   * Determine if the given MIME type represents json.
   */
  public static isJson(mimetype: string) {
    return isIncluded(mimetype, ['application/json']);
  }
}

/**
 * [Helpers]
 */

function isIncluded(mimetype: string, values: string[]) {
  mimetype = (mimetype || '').trim();

  return values.some(item => mimetype.includes(item));
}
