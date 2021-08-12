import { BundleWrapper } from '../BundleWrapper';
import { fs, HttpClient, log, Logger, Path, t, slug, deleteUndefined, PATH } from '../common';

/**
 * Factory for the [pull] method.
 */
export function pullMethod(args: { cachedir: string }) {
  const { cachedir } = args;

  /**
   * Pull the given bundle.
   */
  const fn: t.RuntimeEnvNode['pull'] = async (input, options = {}) => {
    const { silent } = options;
    const bundle = BundleWrapper.create(input, cachedir);
    const host = bundle.host;
    const origin = bundle.toString();
    const targetDir = bundle.cache.dir;
    const tmpTarget = `${targetDir}.download.${slug()}`;

    if (!silent) {
      const url = bundle.urls.manifest;
      const from = Logger.format.url(url.toString());
      const to = Path.trimBase(targetDir);
      const table = log.table({ border: false });

      const add = (key: string, value: string) => {
        table.add([log.gray(` • ${log.white(key)}`), log.gray(value)]);
      };
      add('from ', from);
      add('to', to);

      log.info();
      log.info.gray(`pulling bundle`);
      table.log();
      log.info();
    }

    const client = HttpClient.create(host).cell(bundle.uri);
    const errors: t.IRuntimeError[] = [];
    const addError = (message: string, stack?: string) =>
      errors.push(
        deleteUndefined({
          type: 'RUNTIME/pull',
          bundle: bundle.toObject(),
          message,
          stack,
        }),
      );

    const pullList = async () => {
      try {
        const filter = bundle.dir.append('**');
        const list = await client.fs.list({ filter });
        return list.body;
      } catch (error) {
        addError(error.message, error.stack);
        return [];
      }
    };

    const list = await pullList();

    if (list.length === 0) {
      const err = `The target bundle ${origin} contains no files to pull.`;
      addError(err);
    }

    const save = async (file: t.IHttpClientFileData, body: t.IHttpClientResponse<any>['body']) => {
      const filename = bundle.dir.path
        ? file.path.substring(bundle.dir.path.length + 1)
        : file.path;
      const path = fs.join(tmpTarget, filename);

      if (typeof body === 'object') {
        await fs.stream.save(path, body as any);
      } else if (typeof body === 'string') {
        await fs.ensureDir(fs.dirname(path));
        await fs.writeFile(path, body);
      } else {
        const type = typeof body;
        const mime = file.props.mimetype || '<unknown>';
        const err = `The body type '${type}' for pulled file '${file.path}' is not supported`;
        addError(`${err} (mime:${mime}, ${origin}).`);
      }
    };

    let count = 0;
    await Promise.all(
      list.map(async (file) => {
        try {
          const download = await client.fs.file(file.path).download();
          if (download.ok) {
            count++;
            await save(file, download.body);
          } else {
            let err = `Failed while pulling '${file.path} (${download.status})' from '${origin}'.`;
            err = download.error ? `${err} ${download.error?.message || ''}` : err;
            addError(err);
          }
        } catch (error) {
          const err = error.mesage || '<no-error-info>';
          const msg = `General fail while pulling '${file.path}' from '${origin}'. ${err}`;
          addError(msg, error.stack);
        }
      }),
    );

    const manifest = bundle.dir.append(PATH.MANIFEST);
    if (list.length > 0 && !list.some(({ path }) => path === manifest)) {
      addError(`The bundle does not contain a manifest (expected '${manifest}')`);
    }

    const ok = errors.length === 0;
    if (ok) {
      // Switch the target directory to the downloaded result-set.
      await fs.remove(targetDir);
      await fs.ensureDir(fs.dirname(targetDir));
      await fs.rename(tmpTarget, targetDir);
    }

    if (!silent) {
      const bytes = (await fs.size.dir(targetDir)).toString({ round: 0 });
      const size = count > 0 ? `(${log.yellow(bytes)})` : '';
      log.info.gray(`${log.green(count)} files pulled ${size}`);
      Logger.errors(errors);
      Logger.hr().newline();
    }

    return {
      ok,
      dir: targetDir,
      manifest: bundle.urls.manifest.toString(),
      errors,
    };
  };

  return fn;
}
