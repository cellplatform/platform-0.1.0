import { DEFAULT, Mime, shasum, t, time, Path, deleteUndefined } from './common';

type Id = string;

export function VercelUploadFiles(args: { ctx: t.Ctx; teamId?: Id }): t.VercelHttpUploadFiles {
  const { ctx, teamId } = args;
  const { http, fs } = ctx;

  const api: t.VercelHttpUploadFiles = {
    /**
     * Post a single file to the endpoint.
     */
    async post(input) {
      const timer = time.timer();
      const { file, contentType, contentLength } = await loadFile(fs, input);
      if (!file) {
        throw new Error(`File failed to load: ${input}`);
      }

      const body = Mime.isBinary(contentType) ? file : file?.toString() || '';
      const digest = shasum(file);
      const headers = {
        ...ctx.headers,
        'x-vercel-digest': digest,
        'Content-Length': contentLength.toString(),
        'Content-Type': contentType,
      };

      const url = ctx.url(`now/files`, { teamId });
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
    async upload(dir, options = {}) {
      const timer = time.timer();

      if (!(await fs.is.dir(dir))) {
        throw new Error(`The given path is not a directory. ${dir}`);
      }

      const paths = await toPaths(fs, dir);
      const batched = toBatched(paths, options.batch ?? DEFAULT.batch);

      const res: t.VercelHttpUploadResponse = {
        ok: true,
        status: 200,
        total: { files: paths.length, failed: 0 },
        files: [],
        elapsed: 0,
      };

      const uploadBatch = async (paths: string[]) => {
        await Promise.all(
          paths.map(async (path) => {
            const posted = await api.post(path);
            const { ok, status, contentType, contentLength, digest, error, elapsed } = posted;
            const filepath = path.substring(dir.length + 1);
            const file: t.VercelFileUpload = { file: filepath, sha: digest, size: contentLength };
            res.files.push({ ok, status, contentType, file, error, elapsed });
          }),
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

async function loadFile(fs: t.Fs, input: Uint8Array | string) {
  const octet = 'application/octet-stream';
  const contentType = typeof input === 'string' ? Mime.toType(input, octet) : octet;
  const file = typeof input === 'string' ? await fs.read(input) : input;
  const contentLength = file?.byteLength ?? -1;
  return { file, contentType, contentLength };
}

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
