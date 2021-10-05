import { Subject } from 'rxjs';
import { t, toVimeoError, nodefs } from './common';
import * as tus from 'tus-js-client';

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
}) {
  const { ctx } = args;
  const { http } = ctx;
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
        approach: 'tus',
        size,
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
      if (!(await nodefs.is.file(path))) {
        const status = 404;
        const error = toError(status, `The source file does not exist. ${path}`);
        resolve({ status, error });
      }

      // Calculate size.
      const size = await nodefs.size.file(path);
      if (size.bytes <= 0) {
        const status = 500;
        const error = toError(status, `The source file contains no data (0B). ${path}`);
        resolve({ status, error });
      }

      // Create target <video> record on vimeo.
      const targetResponse = await create(size.bytes, args.props);
      if (targetResponse.error) {
        const { status, error } = targetResponse;
        return resolve({ status, error });
      }
      const { uri, url } = targetResponse.target;

      // Start upload.
      const stream = nodefs.createReadStream(path);
      new tus.Upload(stream, {
        uploadUrl: url.upload,
        uploadSize: size.bytes,
        onError(err) {
          const status = 500;
          const error = toError(status, `Failed while uploading file: ${path}. ${err.message}`);
          resolve({ status, error });
        },
        onProgress(uploaded, total) {
          if (total === 0) return;
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
  (promise as any).progress$ = progress$.asObservable();
  return promise as t.VimeoHttpUploader;
}
