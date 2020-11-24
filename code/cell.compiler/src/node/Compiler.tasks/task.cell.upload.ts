import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { DEFAULT, fs, HttpClient, log, logger, Model, Path, Schema, t, time } from '../common';
import { BundleManifest } from '../Compiler';
import { FileRedirects } from '../config/util.FileRedirects';

type FileUri = t.IUriData<t.IFileData>;
type File = t.IHttpClientCellFileUpload;
const filesize = fs.size.toString;

/**
 * A filter for narrowing in on the manifest file (index.json)
 */
export const manifestFileFilter = (bundleDir: string) => {
  return (path: string) => {
    return path.substring(bundleDir.length + 1) === BundleManifest.filename;
  };
};

/**
 * Retrieve the set of files to upload.
 */
export async function getFiles(args: {
  bundleDir: string;
  targetDir?: string;
  filter?: (path: string) => boolean;
  redirects?: t.CompilerModelRedirect[];
}) {
  const { bundleDir, targetDir = '', redirects } = args;
  const paths = await fs.glob.find(fs.resolve(`${bundleDir}/**`));

  const files = await Promise.all(
    paths
      .filter((path) => (args.filter ? args.filter(path) : true))
      .map(async (path) => {
        const data = await fs.readFile(path);
        const filename = fs.join(targetDir, path.substring(bundleDir.length + 1));
        const allowRedirect = toRedirect({ path, redirects, bundleDir }).flag;
        const file: File = { filename, data, allowRedirect };
        return file;
      }),
  );

  return files.filter((file) => file.data.byteLength > 0);
}

/**
 * Retrieves the manifest file.
 */
export async function getManifestFile(args: { bundleDir: string; targetDir?: string }) {
  const { bundleDir, targetDir } = args;
  const filter = manifestFileFilter(bundleDir);
  return (await getFiles({ bundleDir, targetDir, filter }))[0];
}

/**
 * Upload files to the given target.
 */
export const upload: t.CompilerRunUpload = async (args) => {
  const timer = time.timer();
  const baseDir = fs.resolve('.');
  const { host, targetDir, targetCell, config } = args;
  const model = Model(args.config);
  const bundleDir = model.bundleDir;
  const redirects = config.files?.redirects;
  const files = await getFiles({ bundleDir, targetDir, redirects });

  const done$ = new Subject();
  writeLogFile(log, done$);

  const done = (ok: boolean) => {
    const res: t.CompilerUploadResponse = { ok, files, urls: toUrls(files) };
    done$.next();
    return res;
  };

  const toUrls = (files: t.IHttpClientCellFileUpload[]) => {
    const findFile = (name: string) => files.find((file) => fs.basename(file.filename) === name);
    const urlByFilename = (filename: string) => {
      const file = findFile(filename);
      return file ? cell.file.byName(file.filename).toString() : '';
    };

    const cell = Schema.urls(args.host).cell(args.targetCell);
    const filter = targetDir ? `${targetDir}/**` : undefined;

    return {
      cell: cell.info.toString(),
      files: cell.files.list.query({ filter }).toString(),
      remote: urlByFilename(DEFAULT.FILE.JS.REMOTE_ENTRY),
      manifest: urlByFilename(DEFAULT.FILE.JSON.MANIFEST),
      entry: urlByFilename(model.entryFile),
    };
  };

  try {
    const client = HttpClient.create(host).cell(targetCell);

    /**
     * [1] Perform initial upload of files (retrieving the generated file URIs).
     */
    const fileUpload = await client.files.upload(files);
    if (!fileUpload.ok) {
      logUploadFailure({ host, bundleDir, errors: fileUpload.body.errors });
      return done(false);
    }

    /**
     * [2] Update the manifest with the file-hashes and re-upload it.
     */
    await updateManifest({ bundleDir, uploadedFiles: fileUpload.body.files, redirects });
    const manifestUpload = await client.files.upload(
      await getManifestFile({ bundleDir, targetDir }),
    );
    if (!manifestUpload.ok) {
      logUploadFailure({ host, bundleDir, errors: manifestUpload.body.errors });
      return done(false);
    }

    if (!args.silent) {
      const elapsed = timer.elapsed.toString();
      await logUpload({ baseDir, bundleDir, targetCell, host, elapsed });
      logger.hr().newline();
      logUrls(toUrls(files));
      logger.newline().hr().newline();
    }

    return done(true);
  } catch (err) {
    const message = err.message.includes('ECONNREFUSED')
      ? `Ensure the local server is online. ${log.gray(host)}`
      : err.message;
    log.info.yellow(message);
    log.info();
    return done(false);
  }
};

/**
 * Helpers
 */

async function logUpload(args: {
  host: string;
  baseDir: string;
  bundleDir: string;
  targetCell: string | t.ICellUri;
  elapsed: string;
}) {
  const { host, baseDir, bundleDir, targetCell, elapsed } = args;
  const size = await fs.size.dir(bundleDir);
  const files = size.files;

  const table = log.table({ border: false });
  table.add(['  • host', host]);
  table.add(['  • cell', logger.format.uri(targetCell.toString())]);
  table.add(['  • files: ']);

  const addFile = (path: string, bytes: number) => {
    path = path.substring(baseDir.length + 1);
    path = logger.format.filepath(path);
    const size = filesize(bytes);
    table.add(['', `${path}  `, log.green(size)]);
  };

  files.forEach((file) => addFile(file.path, file.bytes));
  table.add(['', '', log.cyan(size.toString())]);

  log.info(`
${log.gray(`Uploaded`)}    ${log.gray(`(in ${log.yellow(elapsed)})`)}
${log.gray(`  from:     ${Path.trimBase(bundleDir)}`)}
${log.gray(`  to:`)}
${log.gray(table)}
`);
}

function logUrls(links: Record<string, string>) {
  log.info.gray('Links');
  const table = log.table({ border: false });
  Object.keys(links).forEach((key) => {
    const link = links[key];
    if (link) {
      const url = logger.format.url(link);
      table.add([`  ${key} `, url]);
    }
  });
  table.log();
}

const logUploadFailure = (args: { host: string; bundleDir: string; errors: t.IFileError[] }) => {
  const { host, bundleDir, errors } = args;

  log.info.yellow(`Failed to upload files.`);
  log.info.gray(' • dir:     ', bundleDir);
  log.info.gray(' • host:    ', host);
  log.info.gray(' • errors:');
  errors.forEach((err) => {
    log.info();
    log.info.gray(`  • filename: ${log.yellow(err.filename)}`);
    log.info.gray(`    type:     ${err.type}`);
    log.info.gray(`    message:  ${err.message}`);
  });
};

function toRedirect(args: {
  redirects?: t.CompilerModelRedirect[];
  bundleDir?: string;
  path: string;
}) {
  const path = args.bundleDir ? args.path.substring(args.bundleDir.length + 1) : args.path;
  const redirects = FileRedirects(args.redirects);
  return redirects.path(path);
}

async function updateManifest(args: {
  bundleDir: string;
  uploadedFiles: FileUri[];
  redirects?: t.CompilerModelRedirect[];
}) {
  const { uploadedFiles, bundleDir, redirects } = args;
  const { manifest, path } = await BundleManifest.readFile({ bundleDir });
  if (!manifest) {
    throw new Error(`A bundle manifest does not exist at: ${path}`);
  }

  const toHash = (file: FileUri) => file.data.props.integrity?.filehash;
  const findFile = (hash: string) => uploadedFiles.find((file) => toHash(file) === hash);

  manifest.files
    .filter((item) => item.path !== BundleManifest.filename)
    .forEach((item) => {
      const file = findFile(item.filehash);
      if (!file) {
        const err = `UPLOAD FAILED: An uploaded file URI could not be found for file '${item.path}'.`;
        throw new Error(err);
      } else {
        item.uri = file.uri;
      }
    });

  await BundleManifest.writeFile({ manifest, bundleDir });
  return manifest;
}

function writeLogFile(log: t.IServerLog, until$: Observable<any>) {
  const path = fs.resolve('./tmp/logs/upload.log');
  fs.ensureDirSync(fs.dirname(path));
  log.events$
    .pipe(
      takeUntil(until$),
      map((e) => log.stripAnsi(e.payload.output)),
    )
    .subscribe((text) => {
      text = text.replace(/\n$/, '');
      fs.appendFileSync(path, `${text}\n`);
    });
}
