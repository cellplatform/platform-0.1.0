import { ENV, fs, log, t, time, ManifestSource } from '../common';

type Uri = string;
type Directory = string;
type File = t.IHttpClientCellFileUpload;

/**
 * Upload files to the given target.
 */
export async function upload(args: {
  http: t.IHttpClient;
  source: Directory;
  target: { cell: Uri; dir: Directory };
  silent?: boolean;
}) {
  const timer = time.timer();
  const { http, target } = args;
  const host = http.origin;

  let files: t.IHttpClientCellFileUpload[] = [];
  const errors: string[] = [];
  const error = (message: string) => errors.push(message);

  const done = () => {
    const ok = errors.length === 0;
    return { ok, files, errors };
  };

  try {
    const source = ManifestSource(args.source);
    files = await getFiles({ source: source.dir, target: target.dir });

    const res = await http.cell(target.cell).fs.upload(files);

    if (!res.ok) {
      error('Failed while uploading files');
      res.body.errors.forEach((err) => error(`${err.type}: ${err.message}`));

      log.info.yellow(`Failed to upload files.`);
      log.info.gray(' • packaged:', ENV.isPackaged);
      log.info.gray(' • dir:     ', source.toString());
      log.info.gray(' • host:    ', host);
      log.info.gray(' • errors:');
      res.body.errors.forEach((err) => {
        log.info();
        log.info.gray(`  • type:     ${err.type}`);
        log.info.gray(`    message:  ${err.message}`);
      });

      return done(); // Failure.
    }

    if (!args.silent) {
      const elapsed = timer.elapsed.toString();
      const targetCell = target.cell;
      logUpload({ source: source.toString(), targetCell, host, files, elapsed });
    }

    return done(); // Success.
  } catch (err) {
    if (err.message.includes('ECONNREFUSED')) {
      log.info.yellow(`[Upload Error] Ensure the target server is online. ${log.gray(host)}`);
    } else {
      log.info.yellow(`[Upload Error] ${err.message}`);
    }
    error(err.message);
    return done(); // Failure.
  }
}

/**
 * Helpers
 */

/**
 * Retrieve the set of files to upload.
 */
async function getFiles(dir: { source: Directory; target: Directory }) {
  const paths = await fs.glob.find(fs.resolve(`${dir.source}/**`));
  const files = await Promise.all(
    paths.map(async (path) => {
      const filename = fs.join(dir.target, path.substring(dir.source.length + 1));
      const data = await fs.readFile(path);
      const file: File = { filename, data };
      return file;
    }),
  );
  return files.filter((file) => file.data.byteLength > 0);
}

/**
 * Write the details of an upload to the log.
 */
function logUpload(args: {
  source: Directory;
  targetCell: Uri;
  host: string;
  files: File[];
  elapsed: string;
}) {
  const { host, files, source, targetCell, elapsed } = args;
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
${log.gray(` from:      ${source}`)}
${log.gray(` to:`)}
${log.gray(table)}
`);
}
