import { fs, t, util, shasum, Mime, DEFAULT, time } from './common';

type Id = string;

export function VercelUploadFiles(args: { ctx: t.Ctx; teamId?: Id }): t.VercelHttpUploadFiles {
  const { ctx, teamId } = args;
  const { http } = ctx;

  const api: t.VercelHttpUploadFiles = {
    /**
     * Post a single file to the endpoint.
     */
    async post(input) {
      const timer = time.timer();
      const { file, contentType, contentLength } = await loadFile(input);
      const body = Mime.isBinary(contentType) ? file : file.toString();
      const digest = shasum(file);
      const url = ctx.url(`now/files`, { teamId });

      const headers = {
        ...ctx.headers,
        'x-vercel-digest': digest,
        'Content-Length': contentLength.toString(),
        'Content-Type': contentType,
      };

      const res = await http.post(url, body, { headers });
      const { ok, status } = res;
      const json = res.json as any;
      const error = ok ? undefined : (json.error as t.VercelHttpError);
      const elapsed = timer.elapsed.msec;

      return { ok, status, error, digest, contentLength, contentType, elapsed };
    },

    /**
     * Upload a directory of file.
     */
    async upload(dir, options = {}) {
      const timer = time.timer();

      if (!(await fs.is.dir(dir))) {
        throw new Error(`The given path is not a directory. ${dir}`);
      }

      const paths = await toPaths(dir);
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
            const posted = await api.post(fs.join(dir, path));
            const { ok, status, contentType, contentLength, digest, error, elapsed } = posted;
            const file: t.VercelFileUpload = { file: path, sha: digest, size: contentLength };
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
      return res;
    },
  };

  return api;
}

/**
 * [Helpers]
 */

async function loadFile(input: Buffer | string) {
  const octet = 'application/octet-stream';
  const contentType = typeof input === 'string' ? Mime.toType(input, octet) : octet;
  const file = typeof input === 'string' ? await fs.readFile(input) : input;
  const contentLength = file.byteLength;
  return { file, contentType, contentLength };
}

async function toPaths(dir: string, filter?: (path: string) => boolean) {
  const pattern = `${dir.replace(/\/*$/, '')}/**/*`;
  const paths = (await fs.glob.find(pattern)).map((path) => path.substring(dir.length + 1));
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
