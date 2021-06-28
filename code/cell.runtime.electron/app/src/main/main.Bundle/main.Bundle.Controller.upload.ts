import { app } from 'electron';

import { fs, log, slug, t, time, Genesis } from '../common';

type Uri = string;
type File = t.IHttpClientCellFileUpload;

/**
 * Bundle upload behavior logic.
 */
export function UploadController(args: {
  bus: t.EventBus<t.BundleEvent>;
  events: t.BundleEvents;
  http: t.IHttpClient;
}) {
  const { events, http, bus } = args;

  /**
   * Upload bundles to the local server.
   */
  events.upload.req$.subscribe(async (e) => {
    try {
      const { sourceDir, targetDir, silent, tx = slug() } = e;
      const sourceDirExists = await fs.exists(sourceDir);

      const manifest = (await fs.readJson(fs.join(sourceDir, 'index.json'))) as t.ModuleManifest;
      const current = await events.status.get({ dir: targetDir });

      const hash = {
        current: current?.manifest.hash.files || '',
        next: manifest.hash.files,
      };

      const isChanged = current ? hash.current !== hash.next : false;

      if (!isChanged && !e.force && current) {
        const files = current.manifest.files.map(({ path, bytes }) => ({ path, bytes }));
        return bus.fire({
          type: 'runtime.electron/Bundle/upload:res',
          payload: { tx, ok: true, files, errors: [], action: 'unchanged' },
        });
      }

      const genesis = Genesis(http);
      const targetCell = await genesis.modules.uri();
      const res = await upload({ http, targetCell, sourceDir, targetDir, silent });
      const { ok, errors } = res;
      const files = res.files.map(({ filename, data }) => ({
        path: filename,
        bytes: data.byteLength,
      }));

      const action = Boolean(current) ? 'replaced' : 'written';
      return bus.fire({
        type: 'runtime.electron/Bundle/upload:res',
        payload: { tx, ok, files, errors, action },
      });
    } catch (error) {
      log.error('Bundle Upload Error: ', error.message);
      log.error();
    }
  });
}

/**
 * Helpers
 */

/**
 * Retrieve the set of files to upload.
 */
async function getFiles(args: { sourceDir: string; targetDir?: string }) {
  const { sourceDir, targetDir = '' } = args;
  const paths = await fs.glob.find(fs.resolve(`${sourceDir}/**`));

  const files = await Promise.all(
    paths.map(async (path) => {
      const filename = fs.join(targetDir, path.substring(sourceDir.length + 1));
      const data = await fs.readFile(path);
      const file: File = { filename, data };
      return file;
    }),
  );

  return files.filter((file) => file.data.byteLength > 0);
}

/**
 * Upload files to the given target.
 */
async function upload(args: {
  http: t.IHttpClient;
  sourceDir: string;
  targetCell: Uri | t.ICellUri;
  targetDir?: string;
  files?: File[];
  silent?: boolean;
}) {
  const timer = time.timer();
  const { http, sourceDir, targetDir, targetCell } = args;
  const host = http.origin;
  const files = args.files ? args.files : await getFiles({ sourceDir, targetDir });

  const errors: string[] = [];
  const error = (message: string) => errors.push(message);

  const done = () => {
    const ok = errors.length === 0;
    return { ok, files, errors };
  };

  try {
    const res = await http.cell(targetCell).fs.upload(files);

    if (!res.ok) {
      error('Failed while uploading files');
      res.body.errors.forEach((err) => error(`${err.type}: ${err.message}`));

      log.info.yellow(`Failed to upload files.`);
      log.info.gray(' • packaged:', app.isPackaged);
      log.info.gray(' • dir:     ', sourceDir);
      log.info.gray(' • host:    ', host);
      log.info.gray(' • errors:');
      res.body.errors.forEach((err) => {
        log.info();
        log.info.gray(`  • type:     ${err.type}`);
        log.info.gray(`    message:  ${err.message}`);
      });

      return done();
    }

    if (!args.silent) {
      const elapsed = timer.elapsed.toString();
      logUpload({ sourceDir, targetCell, host, files, elapsed });
    }

    return done();
  } catch (err) {
    if (err.message.includes('ECONNREFUSED')) {
      log.info.yellow(`Ensure the target server is online. ${log.gray(host)}`);
      log.info();
    }
    error(err.message);
    return done();
  }
}

function logUpload(args: {
  sourceDir: string;
  targetCell: string | t.ICellUri;
  host: string;
  files: File[];
  elapsed: string;
}) {
  const { host, files, sourceDir, targetCell, elapsed } = args;
  const bytes = files.reduce((acc, next) => acc + next.data.byteLength, 0);
  const size = fs.size.toString(bytes);
  const isLocalhost = host === 'localhost' || host.startsWith('localhost:');
  const protocol = isLocalhost ? 'http' : 'https';

  const table = log.table({ border: false });
  table.add(['  • host', `${protocol}://${host}`]);
  table.add(['  • cell', log.format.uri(targetCell)]);
  table.add(['  • files: ']);

  const addFile = (file: File) => {
    const { filename, data } = file;
    const name = log.format.filepath(filename);
    const size = fs.size.toString(data.byteLength);
    table.add(['', `${name} `, size]);
  };
  files.filter((file) => file.filename.endsWith('.map')).forEach((file) => addFile(file));
  files.filter((file) => !file.filename.endsWith('.map')).forEach((file) => addFile(file));
  table.add(['', '', log.white(size)]);

  log.info(`

${log.white(`uploaded`)}    ${log.gray(`(${elapsed})`)}
${log.gray(` from:      ${sourceDir}`)}
${log.gray(` to:`)}
${log.gray(table)}
`);
}
