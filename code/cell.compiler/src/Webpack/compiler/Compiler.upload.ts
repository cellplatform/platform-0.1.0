import { fs, HttpClient, log, t, time, Schema, path, logger } from '../common';
import * as util from './util';

type File = t.IHttpClientCellFileUpload;
const filesize = fs.size.toString;

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
export const upload: t.WebpackUpload = async (args) => {
  const timer = time.timer();
  const { host, sourceDir, targetDir, targetCell } = args;
  const files = await getFiles({ sourceDir, targetDir });
  const bytes = files.reduce((acc, next) => acc + next.data.byteLength, 0);

  const links = () => {
    const cell = Schema.urls(args.host).cell(args.targetCell);
    return {
      cell: cell.info.toString(),
      files: cell.files.list.toString(),
    };
  };

  const done = (ok: boolean) => {
    return { ok, bytes, files, urls: links() };
  };

  try {
    const client = HttpClient.create(host);
    const res = await client.cell(targetCell).files.upload(files);

    if (!res.ok) {
      log.info.yellow(`Failed to upload files.`);
      log.info.gray(' • dir:     ', sourceDir);
      log.info.gray(' • host:    ', host);
      log.info.gray(' • errors:');
      res.body.errors.forEach((err) => {
        log.info();
        log.info.gray(`  • filename: ${log.yellow(err.filename)}`);
        log.info.gray(`    type:     ${err.type}`);
        log.info.gray(`    message:  ${err.message}`);
      });

      return done(false);
    }

    if (!args.silent) {
      const elapsed = timer.elapsed.toString();
      logUpload({ sourceDir, targetCell, host, files, elapsed, bytes });
      logger.hr().newline();
      logUrls(links());
      logger.newline();
    }

    return done(true);
  } catch (err) {
    if (err.message.includes('ECONNREFUSED')) {
      log.info.yellow(`Ensure the local CellOS server is online. ${log.gray(host)}`);
      log.info();
    }
    return done(false);
  }
};

/**
 * Helpers
 */

function logUpload(args: {
  sourceDir: string;
  targetCell: string | t.ICellUri;
  host: string;
  files: File[];
  elapsed: string;
  bytes: number;
}) {
  const { host, files, sourceDir, targetCell, elapsed } = args;
  const size = filesize(args.bytes);

  const table = log.table({ border: false });
  table.add(['  • host', host]);
  table.add(['  • cell', targetCell.toString()]);
  table.add(['  • files: ']);

  const addFile = (file: File) => {
    const { filename, data } = file;
    const name = filename.endsWith('.map') ? log.gray(filename) : log.white(filename);
    const size = filesize(data.byteLength);
    table.add(['', name, log.green(size)]);
  };

  files.filter((file) => file.filename.endsWith('.map')).forEach((file) => addFile(file));
  files.filter((file) => !file.filename.endsWith('.map')).forEach((file) => addFile(file));
  table.add(['', '', log.cyan(size)]);

  log.info(`
${log.gray(`Uploaded`)}    ${log.gray(`(in ${log.yellow(elapsed)})`)}
${log.gray(`  from:     ${path.trimBaseDir(sourceDir)}`)}
${log.gray(`  to:`)}
${log.gray(table)}
`);
}

function logUrls(links: Record<string, string>) {
  log.info.gray('Urls');
  const table = log.table({ border: false });

  Object.keys(links).forEach((key) => {
    const url = links[key];
    table.add([`  ${key}  `, log.green(url)]);
  });

  table.log();
}
