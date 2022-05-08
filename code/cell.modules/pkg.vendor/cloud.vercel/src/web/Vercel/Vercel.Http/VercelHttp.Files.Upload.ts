import { DEFAULT, Mime, shasum, t, time, deleteUndefined } from './common';

type Id = string;

export function VercelHttpUploadFiles(args: { ctx: t.Ctx; teamId?: Id }): t.VercelHttpUploadFiles {
  const { ctx, teamId } = args;
  const { http, fs } = ctx;

  const toMimetype = (path: string) => {
    const BINARY = 'application/octet-stream';
    const mime = Mime.toType(path, BINARY);
    if (mime === 'application/zip') return BINARY; // HACK: Vercel rejects this mime-type (as of May 2022, issue opened with them).
    return mime;
  };

  const api: t.VercelHttpUploadFiles = {
    /**
     * Post a single file to the endpoint.
     * https://vercel.com/docs/rest-api#endpoints/deployments/upload-deployment-files
     */
    async post(path, input) {
      const timer = time.timer();
      const body = input;
      const contentLength = body.byteLength;
      const contentType = toMimetype(path);

      const digest = shasum(body);
      const headers = {
        ...ctx.headers,
        'x-vercel-digest': digest,
        'Content-Type': contentType,
      };

      const url = ctx.url(2, `now/files`, { teamId });
      const res = await http.post(url, body, { headers });
      const { ok, status } = res;
      const json = res.json as any;
      const error = ok ? undefined : (json.error as t.VercelHttpError);
      const elapsed = timer.elapsed.msec;

      return deleteUndefined({ ok, status, error, digest, contentLength, contentType, elapsed });
    },

    /**
     * Upload a directory of file.
     */
    async upload(source, options = {}) {
      const { beforeUpload } = options;
      const timer = time.timer();

      if (typeof source === 'string' && !(await fs.is.dir(source))) {
        throw new Error(`The source is not a directory. ${source}`);
      }

      const loadFiles = async (dir: string): Promise<t.VercelFile[]> => {
        const paths = await toPaths(fs, dir);
        return await Promise.all(
          paths.map(async (path) => {
            const data = await fs.read(path);
            if (!data) throw new Error(`Failed to read file: ${path}`);
            return { path, data };
          }),
        );
      };

      const files = typeof source === 'string' ? await loadFiles(source) : source.files;
      const batched = toBatched(files, options.batch ?? DEFAULT.batch);

      const res: t.VercelHttpUploadResponse = {
        ok: true,
        status: 200,
        total: { files: files.length, failed: 0 },
        files: [],
        elapsed: 0,
      };

      const prepareFile = async (path: string, data: Uint8Array) => {
        if (typeof beforeUpload === 'function') {
          await beforeUpload({
            path,
            data,
            toString: () => new TextDecoder().decode(data),
            modify(input) {
              if (typeof input === 'string') data = new TextEncoder().encode(input);
              if (typeof input !== 'string') data = input;
            },
          });
        }
        return data;
      };

      const postFile = async (path: string, data: Uint8Array) => {
        // POST to the cloud.
        data = await prepareFile(path, data);
        const posted = await api.post(path, data);

        // Prepare response.
        const { ok, status, contentType, contentLength, digest, error, elapsed } = posted;
        const filepath = typeof source === 'string' ? path.substring(source.length + 1) : path;
        const file: t.VercelFileUpload = { file: filepath, sha: digest, size: contentLength };
        res.files.push({ ok, status, contentType, file, error, elapsed });
      };

      const uploadBatch = async (files: t.VercelFile[]) => {
        await Promise.all(
          files
            .filter(({ data }) => Boolean(data))
            .map(({ path, data }) => postFile(path, data as Uint8Array)),
        );
      };

      for (const batch of batched) {
        await uploadBatch(batch);
      }

      res.total.failed = res.files.reduce((acc, next) => (next.error ? acc + 1 : acc), 0);
      res.ok = res.total.failed === 0;
      res.status = res.ok ? 200 : 400;
      res.elapsed = timer.elapsed.msec;
      return deleteUndefined(res);
    },
  };

  return api;
}

/**
 * [Helpers]
 */

async function toPaths(fs: t.Fs, dir: string, filter?: (path: string) => boolean) {
  const include = (path: string) => !path.endsWith('.DS_Store');
  const manifest = await fs.manifest({ dir });
  const paths = manifest.files.filter((file) => include(file.path)).map((file) => file.path);
  return filter ? paths.filter(filter) : paths;
}

function toBatched<T>(items: T[], size: number) {
  size = Math.max(1, size);
  const batches: T[][] = [];
  let batch = -1;

  items.forEach((item, i) => {
    if (i % size === 0) batch++;
    if (!batches[batch]) batches[batch] = [];
    batches[batch].push(item);
  });

  return batches;
}
