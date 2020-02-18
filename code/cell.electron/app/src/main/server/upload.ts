import { app } from 'electron';
import { Client, constants, fs, log, t } from '../common';

type File = t.IClientCellFileUpload;

export async function getFiles(args: { dir: string }) {
  const { dir } = args;
  const paths = await fs.glob.find(fs.resolve(`${dir}/**`));

  const wait = paths.map(async path => {
    const filename = path.substring(dir.length + 1);
    const data = await fs.readFile(path);
    const file: File = { filename, data };
    return file;
  });

  return Promise.all(wait);
}

export async function upload(args: { dir: string; files?: File[]; silent?: boolean }) {
  const { dir } = args;

  const p = app.getAppPath();
  log.info('getAppPath', p);
  log.info('dir', dir);

  const files = args.files ? args.files : await getFiles({ dir });

  const done = (ok: boolean) => {
    return { ok, files };
  };

  const host = constants.HOST;
  const client = Client.create(host);
  try {
    const res = await client.cell(constants.URI.UI).files.upload(files);

    if (!res.ok) {
      log.info.yellow(`Failed to upload files.`);
      log.info.gray('• packaged:', app.isPackaged);
      log.info.gray('• dir:     ', dir);
      log.info.gray('• host:    ', host);
      log.info();
      return done(false);
    }

    if (!args.silent) {
      logUpload({ dir, host, files });
    }

    return done(true);
  } catch (err) {
    console.log('err', err);
    if (err.message.includes('ECONNREFUSED')) {
      log.info.yellow(`Ensure the local CellOS server is online. ${log.gray(client.origin)}`);
      log.info();
    }
    return done(false);
  }
}

/**
 * Helpers
 */

function logUpload(args: { dir: string; host: string; files: File[] }) {
  const { host, files, dir } = args;

  const table = log.table({ border: false });
  table.add([' • dir', dir]);
  table.add([' • host', host]);
  table.add([' • cell', constants.URI.UI]);
  table.add([' • files: ']);

  const addFile = (file: File) => {
    const { filename, data } = file;
    const name = filename.endsWith('.map') ? log.gray(filename) : log.green(filename);
    const size = fs.size.toString(data.byteLength);
    table.add(['', name, size]);
  };
  files.filter(file => file.filename.endsWith('.map')).forEach(file => addFile(file));
  files.filter(file => !file.filename.endsWith('.map')).forEach(file => addFile(file));

  log.info(`

${log.blue('uploaded:')}
${log.gray(table)}
`);
}
