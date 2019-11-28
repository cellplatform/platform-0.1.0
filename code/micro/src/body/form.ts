import * as Busboy from 'busboy';
import { t, value as valueUtil } from '../common';

/**
 * Parse form-data from an HTTP request.
 */
export function form(req: t.Request, options: { limits?: t.IFormLimits } = {}) {
  return new Promise<t.IForm>((resolve, reject) => {
    const { headers } = req;
    const { limits } = options;
    const busboy = new Busboy({ headers, limits });

    const fields: t.IFormField[] = [];
    const files: t.IFormFile[] = [];

    /**
     * Files
     */
    busboy.on('file', (field, file, filename, encoding, mimetype) => {
      const buffers: Buffer[] = [];
      file.on('data', data => buffers.push(data));
      file.on('end', () => {
        files.push({
          field,
          filename,
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
        // NB: Ignore JSON parse or type conversion error - raw value used instead.
      }
      fields.push({ key, value });
    });

    // Finish up.
    busboy.on('finish', () => resolve({ fields, files }));
    req.pipe(busboy);
  });
}
