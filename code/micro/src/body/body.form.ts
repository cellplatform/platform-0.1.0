import * as Busboy from 'busboy';
import { t, value as valueUtil } from '../common';

/**
 * Parse form-data from an HTTP request.
 * See:
 *    https://github.com/mscdex/busboy#busboy-methods
 */
export function form(req: t.HttpRequest, options: t.ParseBodyFormOptions = {}) {
  return new Promise<t.IForm>(resolve => {
    const { headers } = req;
    const { limits } = options;
    const busboy = new Busboy({ headers, limits });

    const fields: t.IFormField[] = [];
    const files: t.IFormFile[] = [];

    /**
     * Files
     */
    busboy.on('file', (field, file, name, encoding, mimetype) => {
      const buffers: Buffer[] = [];
      file.on('data', data => buffers.push(data));
      file.on('end', () => {
        files.push({
          field,
          name,
          encoding,
          mimetype,
          buffer: Buffer.concat(buffers),
        });
      });
    });

    /**
     * Fields
     */
    busboy.on('field', (key, value, fieldnameTruncated, valTruncated, encoding, mimetype) => {
      try {
        value = valueUtil.isJson(value) ? JSON.parse(value) : valueUtil.toType(value);
      } catch (error) {
        // NB: Ignore JSON-parse or type-conversion error
        //     (use raw value instead).
      }
      fields.push({ key, value });
    });

    // Finish up.
    busboy.on('finish', () => resolve({ fields, files }));
    (req as any).pipe(busboy);
  });
}
