import { app } from 'electron';
import { fs, HttpClient, log, t, time } from '../common';

type Uri = string;
type File = t.IHttpClientCellFileUpload;

/**
 * Retrieve the set of files to upload.
 */
export async function getFiles(args: { sourceDir: string; targetDir?: string }) {
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
export async function upload(args: {
  host: string;
  sourceDir: string;
  targetCell: Uri | t.ICellUri;
  targetDir?: string;
  files?: File[];
  silent?: boolean;
}) {
  const timer = time.timer();
  const { host, sourceDir, targetDir, targetCell } = args;
  const files = args.files ? args.files : await getFiles({ sourceDir, targetDir });

  let errors: string[] = [];
  const error = (message: string) => errors.push(message);

  const done = () => {
    const ok = errors.length === 0;
    return { ok, files, errors };
  };

  try {
    const client = HttpClient.create(host);
    const res = await client.cell(targetCell).fs.upload(files);

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

/**
 * Helpers
 */

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

  const table = log.table({ border: false });
  table.add(['  • host', host]);
  table.add(['  • cell', targetCell.toString()]);
  table.add(['  • files: ']);

  const addFile = (file: File) => {
    const { filename, data } = file;
    const name = filename.endsWith('.map') ? log.gray(filename) : log.green(filename);
    const size = fs.size.toString(data.byteLength);
    table.add(['', name, size]);
  };
  files.filter((file) => file.filename.endsWith('.map')).forEach((file) => addFile(file));
  files.filter((file) => !file.filename.endsWith('.map')).forEach((file) => addFile(file));

  log.info(`

${log.blue(`uploaded`)}    ${log.gray(`(${size} in ${elapsed})`)}
${log.gray(` from:      ${sourceDir}`)}
${log.gray(` to:`)}
${log.gray(table)}
`);
}
