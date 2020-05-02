import { app } from 'electron';
import { fs, HttpClient, log, t, time } from '../common';

type File = t.IHttpClientCellFileUpload;

/**
 * Retrieve the set of files to upload.
 */
export async function getFiles(args: { sourceDir: string; targetDir?: string }) {
  const { sourceDir, targetDir = '' } = args;
  const paths = await fs.glob.find(fs.resolve(`${sourceDir}/**`));

  const files = await Promise.all(
    paths.map(async path => {
      const filename = fs.join(targetDir, path.substring(sourceDir.length + 1));
      const data = await fs.readFile(path);
      const file: File = { filename, data };
      return file;
    }),
  );

  return files.filter(file => file.data.byteLength > 0);
}

/**
 * Upload files to the given target
 */
export async function upload(args: {
  host: string;
  targetCell: string;
  sourceDir: string;
  targetDir?: string;
  files?: File[];
  silent?: boolean;
}) {
  const timer = time.timer();
  const { host, sourceDir, targetDir, targetCell } = args;
  const files = args.files ? args.files : await getFiles({ sourceDir, targetDir });

  const done = (ok: boolean) => {
    return { ok, files };
  };

  try {
    const client = HttpClient.create(host);
    const res = await client.cell(targetCell).files.upload(files);

    if (!res.ok) {
      log.info.yellow(`Failed to upload files.`);
      log.info.gray(' • packaged:', app.isPackaged);
      log.info.gray(' • dir:     ', sourceDir);
      log.info.gray(' • host:    ', host);
      log.info.gray(' • errors:');
      res.body.errors.forEach(err => {
        log.info();
        log.info.gray(`  • filename: ${log.yellow(err.filename)}`);
        log.info.gray(`    type:     ${err.type}`);
        log.info.gray(`    message:  ${err.message}`);
      });

      return done(false);
    }

    if (!args.silent) {
      const elapsed = timer.elapsed.toString();
      logUpload({ sourceDir, targetCell, host, files, elapsed });
    }

    return done(true);
  } catch (err) {
    if (err.message.includes('ECONNREFUSED')) {
      log.info.yellow(`Ensure the local CellOS server is online. ${log.gray(host)}`);
      log.info();
    }
    return done(false);
  }
}

/**
 * Helpers
 */

function logUpload(args: {
  sourceDir: string;
  targetCell: string;
  host: string;
  files: File[];
  elapsed: string;
}) {
  const { host, files, sourceDir, targetCell, elapsed } = args;
  const bytes = files.reduce((acc, next) => acc + next.data.byteLength, 0);
  const size = fs.size.toString(bytes);

  const table = log.table({ border: false });
  table.add(['  • host', host]);
  table.add(['  • cell', targetCell]);
  table.add(['  • files: ']);

  const addFile = (file: File) => {
    const { filename, data } = file;
    const name = filename.endsWith('.map') ? log.gray(filename) : log.green(filename);
    const size = fs.size.toString(data.byteLength);
    table.add(['', name, size]);
  };
  files.filter(file => file.filename.endsWith('.map')).forEach(file => addFile(file));
  files.filter(file => !file.filename.endsWith('.map')).forEach(file => addFile(file));

  log.info(`

${log.blue(`uploaded`)}    ${log.gray(`(${size} in ${elapsed})`)}
${log.gray(` from:      ${sourceDir}`)}
${log.gray(` to:`)}
${log.gray(table)}
`);
}
