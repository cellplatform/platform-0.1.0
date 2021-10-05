import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import * as tus from 'tus-js-client';

import { R, t, toVimeoError } from './common';

type FilePath = string;
type Bytes = number;

/**
 * Wrapper around the "upload video" HTTP/API.
 * See:
 *    https://developer.vimeo.com/api/reference/videos#uploads
 *    https://developer.vimeo.com/api/upload/videos
 *    https://tus.io
 */
export function VimeoHttpUpload(args: {
  ctx: t.HttpCtx;
  source: FilePath;
  props: t.VimeoHttpUploadProps;
  convertUploadFile: t.ConvertUploadFile;
}) {
  const { ctx, props } = args;
  const { http, fs } = ctx;
  const progress$ = new Subject<t.VimeoHttpUploadProgress>();

  /**
   * Create the target video object on Vimeo.
   */
  const create = async (size: Bytes, props: t.VimeoHttpUploadProps) => {
    const url = 'https://api.vimeo.com/me/videos';
    const headers = { ...ctx.headers, Accept: 'application/vnd.vimeo.*+json;version=3.4' };
    const body = {
      name: props.name ?? 'Unnamed',
      description: props.description,
      upload: {
        size,
        approach: 'tus',
        mime_type: props.mimetype,
        license: props.license,
      },
    };

    const res = await http.post(url, body, { headers });
    const json = res.json as any;

    // Error.
    if (!res.ok) {
      const { status } = res;
      const message = `Failed to create video upload target.`;
      const error = toVimeoError(res, message);
      return { status, error };
    }

    const target = {
      uri: json.uri,
      url: {
        manage: `https://vimeo.com${json.manage_link}`,
        upload: json.upload.upload_link,
      },
    };

    const { status } = res;
    return { status, target };
  };

  /**
   * Start the upload.
   */
  const promise = new Promise<t.VimeoHttpUploaderResponse>(async (resolve, reject) => {
    try {
      const path = args.source;

      const toError = (status: number, message: string) => {
        const detail = `[${status}] ${message}`;
        return { code: -1, message, detail };
      };

      // Ensure file exists.
      const file = await fs.read(path);
      if (!file) {
        const status = 404;
        const error = toError(status, `The source file does not exist. ${path}`);
        resolve({ status, error });
      }
      if (!file) throw new Error('No file'); // NB: Supress typescript error (handled in check above).

      // Calculate size.
      const bytes = file.byteLength;
      if (bytes === 0) {
        const status = 500;
        const error = toError(status, `The source file contains no data (0B). ${path}`);
        resolve({ status, error });
      }

      // Create target <video> record on vimeo.
      const targetResponse = await create(bytes, props);
      if (targetResponse.error) {
        const { status, error } = targetResponse;
        return resolve({ status, error });
      }
      const { uri, url } = targetResponse.target;

      // Start upload.
      const stream = args.convertUploadFile(file);
      new tus.Upload(stream, {
        chunkSize: props.chunkSize ?? 150000, //
        uploadUrl: url.upload,
        uploadSize: bytes,
        onError(err) {
          const status = 500;
          const error = toError(status, `Failed while uploading file: ${path}. ${err.message}`);
          resolve({ status, error });
        },
        onProgress(uploaded, total) {
          if (total === 0) return; // NB: Avoid divide-by-zero error.
          const percent = uploaded / total;
          progress$.next({ total, uploaded, percent });
        },
        onSuccess() {
          resolve({
            status: 200,
            video: { uri, url: { manage: url.manage } },
          });
        },
      }).start();
    } catch (error) {
      reject(error);
    }
  });

  // Finish up.
  (promise as any).progress$ = progress$.pipe(
    distinctUntilChanged((prev, next) => R.equals(prev, next)),
  );
  return promise as t.VimeoHttpUploader;
}
