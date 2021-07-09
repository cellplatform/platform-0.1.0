import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import {
  DEFAULT,
  fs,
  HttpClient,
  log,
  Logger,
  Model,
  PATH,
  Path,
  ProgressSpinner,
  rx,
  Schema,
  t,
  time,
  value,
} from '../common';
import { FileAccess, FileRedirects } from '../config';
import { ModuleManifest } from '../manifest';

type FileUri = t.IUriData<t.IFileData>;
type File = t.IHttpClientCellFileUpload;
const filesize = fs.size.toString;

/**
 * A filter for narrowing in on the manifest file (index.json)
 */
export const manifestFileFilter = (distDir: string) => {
  return (path: string) => {
    return path.substring(distDir.length + 1) === ModuleManifest.filename;
  };
};

/**
 * Retrieve the set of files to upload.
 */
export async function getFiles(args: {
  distDir: string;
  targetDir?: string;
  filter?: (path: string) => boolean;
  config?: t.CompilerModel;
}) {
  const { distDir, targetDir = '', config } = args;
  const paths = await fs.glob.find(fs.resolve(`${distDir}/**`));
  const files = await Promise.all(
    paths
      .filter((path) => (args.filter ? args.filter(path) : true))
      .map(async (path) => {
        const data = await fs.readFile(path);
        const filename = fs.join(targetDir, path.substring(distDir.length + 1));
        const access = toAccess({ config, path, distDir });
        const file = value.deleteUndefined<File>({
          filename,
          data,
          allowRedirect: toRedirect({ config, path, distDir }).flag,
          's3:permission': access.public ? 'public-read' : undefined,
        });
        return file;
      }),
  );

  return files.filter((file) => file.data.byteLength > 0);
}

/**
 * Retrieves the manifest file.
 */
export async function getManifestFile(args: { distDir: string; targetDir?: string }) {
  const { distDir, targetDir } = args;
  const filter = manifestFileFilter(distDir);
  return (await getFiles({ distDir, targetDir, filter }))[0];
}

/**
 * Upload files to the given target.
 */
export const upload: t.CompilerRunUpload = async (args) => {
  const timer = time.timer();
  const baseDir = fs.resolve('.');
  const { host, targetDir, targetCell, config, silent } = args;

  const model = Model(args.config);
  const distDir = model.paths.out.dist;
  const redirects = config.files?.redirects;
  const files = await getFiles({ distDir, targetDir, config });

  const done$ = new Subject<void>();
  writeLogFile(log, done$);

  const spinner = ProgressSpinner({ label: `uploading ${files.length} files`, silent });
  if (!silent) {
    spinner.start();
  }

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
    type E = t.IHttpClientUploadedEvent;
    const fileUploading = client.fs.upload(files);
    rx.payload<E>(fileUploading.event$, 'HttpClient/uploaded').subscribe((e) => {
      const { total, completed } = e;
      spinner.update({ total, completed });
    });

    const fileUpload = await fileUploading;

    if (!fileUpload.ok) {
      spinner.stop();
      logUploadFailure({ host, distDir, errors: fileUpload.body.errors });
      return done(false);
    }

    /**
     * [2] Update the manifest with the file-hashes and re-upload it.
     */
    const manifest = await updateManifest({
      distDir,
      uploadedFiles: fileUpload.body.files,
      redirects,
    });
    const manifestFile = await getManifestFile({ distDir, targetDir });
    const manifestUpload = await client.fs.upload(manifestFile);
    if (!manifestUpload.ok) {
      spinner.stop();
      logUploadFailure({ host, distDir, errors: manifestUpload.body.errors });
      return done(false);
    }

    if (!silent) {
      spinner.stop();
      const elapsed = timer.elapsed.toString();
      await logUpload({ baseDir, distDir, targetCell, host, elapsed, manifest });
      Logger.hr().newline();
      logUrls(toUrls(files));
      Logger.newline().hr().newline();
    }

    return done(true);
  } catch (err) {
    spinner.stop();
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
  distDir: string;
  targetCell: string | t.ICellUri;
  elapsed: string;
  manifest: t.ModuleManifest;
}) {
  const { host, baseDir, distDir, targetCell, elapsed, manifest } = args;
  const size = await fs.size.dir(distDir);
  const files = size.files;

  const table = log.table({ border: false });
  table.add(['  • host', host]);
  table.add(['  • cell', Logger.format.uri(targetCell.toString())]);
  table.add(['  • files: ']);

  const addFile = (path: string, bytes: number) => {
    path = path.substring(baseDir.length + 1);
    path = Logger.format.filepath(path);
    const size = filesize(bytes);
    table.add(['', `${path}  `, log.green(size)]);
  };

  files.forEach((file) => addFile(file.path, file.bytes));
  table.add(['', '', log.cyan(size.toString()), log.gray(`(${files.length} files)`)]);

  log.info(`
${log.gray(`Uploaded`)}    ${log.gray(`(in ${log.yellow(elapsed)})`)}
${log.gray(`  from:     ${Path.trimBase(distDir)}`)}
${log.gray(`  to:`)}
${log.gray(table)}

${log.gray('manifest.hash.files:')}
${log.gray(manifest.hash.files)}`);
}

function logUrls(links: Record<string, string>) {
  log.info.gray('Links');
  const table = log.table({ border: false });
  Object.keys(links).forEach((key) => {
    const link = links[key];
    if (link) {
      const url = Logger.format.url(link);
      table.add([`  ${key} `, url]);
    }
  });
  table.log();
}

const logUploadFailure = (args: { host: string; distDir: string; errors: t.IHttpError[] }) => {
  const { host, distDir, errors } = args;

  log.info.yellow(`Failed to upload files.`);
  log.info.gray(' • dir:      ', distDir);
  log.info.gray(' • host:     ', host);
  log.info.gray(' • errors:');
  errors.forEach((err) => {
    log.info.gray(`   - type:    ${err.type}`);
    log.info.gray(`     message: ${err.message}`);
    log.info();
  });
};

function trimDistDir(dir: string | undefined, path: string) {
  return dir ? path.substring(dir.length + 1) : path;
}

function toRedirect(args: { config?: t.CompilerModel; distDir?: string; path: string }) {
  const path = trimDistDir(args.distDir, args.path);
  const redirects = FileRedirects(args.config?.files?.redirects);
  return redirects.path(path);
}

function toAccess(args: { config?: t.CompilerModel; distDir?: string; path: string }) {
  const path = trimDistDir(args.distDir, args.path);
  const access = FileAccess(args.config?.files?.access);
  return access.path(path);
}

async function updateManifest(args: {
  distDir: string;
  uploadedFiles: FileUri[];
  redirects?: t.CompilerModelRedirect[];
}) {
  const { uploadedFiles, distDir, redirects } = args;
  const { manifest, path } = await ModuleManifest.read({ dir: distDir });
  if (!manifest) {
    throw new Error(`A bundle manifest does not exist at: ${path}`);
  }

  const toHash = (file: FileUri) => file.data.props.integrity?.filehash;
  const findFile = (hash: string) => uploadedFiles.find((file) => toHash(file) === hash);

  manifest.files
    .filter((item) => item.path !== ModuleManifest.filename)
    .forEach((item) => {
      const file = findFile(item.filehash);
      if (!file) {
        const err = `UPLOAD FAILED: An uploaded file URI could not be found for file '${item.path}'.`;
        throw new Error(err);
      } else {
        item.uri = file.uri;
      }
    });

  await ModuleManifest.write({ manifest, dir: distDir });
  return manifest;
}

function writeLogFile(log: t.IServerLog, until$: Observable<any>) {
  const path = fs.join(PATH.LOGDIR, 'upload.log');
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
