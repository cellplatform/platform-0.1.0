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
    return !Mime.isText(mimetype);
  }

  /**
   * Determine if the given MIME type represents a text file.
   */
  public static isText(mimetype: string) {
    mimetype = (mimetype || '').trim();

    if (mimetype.startsWith('text/')) {
      return true;
    }

    if (['application/javascript', 'application/json'].includes(mimetype)) {
      return true;
    }

    return false;
  }

  /**
   * Determine if the given MIME type represents json.
   */
  public static isJson(mimetype: string) {
    mimetype = (mimetype || '').trim();
    return mimetype === 'application/json';
  }
}
