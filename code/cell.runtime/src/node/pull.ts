import { Bundle } from './Bundle';
import { fs, HttpClient, log, logger, Path, t, id } from './common';

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
    const bundle = Bundle.create(input, cachedir);
    const host = bundle.host;
    const origin = bundle.toString();
    const targetDir = bundle.cache.dir;
    const tmpTarget = `${targetDir}.download.${id.shortid()}`;

    if (!silent) {
      const url = bundle.urls.manifest;
      const from = logger.format.url(url.toString());
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
    const addError = (message: string) =>
      errors.push({
        type: 'RUNTIME/pull',
        bundle: bundle.toObject(),
        message,
      });

    const pullList = async () => {
      try {
        const filter = bundle.dir.append('**');
        const list = await client.files.list({ filter });
        return list.body;
      } catch (error) {
        addError(error.message);
        return [];
      }
    };

    const list = await pullList();

    if (list.length === 0) {
      const err = `The target bundle ${origin} contains no files to pull.`;
      addError(err);
    }

    let count = 0;
    await Promise.all(
      list.map(async (file) => {
        try {
          const res = await client.file.name(file.path).download();

          if (res.ok) {
            count++;
            const filename = bundle.dir.path
              ? file.path.substring(bundle.dir.path.length + 1)
              : file.path;
            const path = fs.join(tmpTarget, filename);

            if (typeof res.body === 'object') {
              await fs.stream.save(path, res.body as any);
            } else if (typeof res.body === 'string') {
              await fs.ensureDir(fs.dirname(path));
              await fs.writeFile(path, res.body);
            } else {
              const type = typeof res.body;
              const mime = file.props.mimetype || '<unknown>';
              const err = `Type '${type}' for pulled file '${file.path}' is not supported`;
              addError(`${err} (mime: ${mime}).`);
            }
          } else {
            let err = `Failed while pulling '${file.path} (${res.status})' from '${origin}'.`;
            err = res.error ? `${err} ${res.error?.message || ''}` : err;
            addError(err);
          }
        } catch (error) {
          console.log('DOWNLOAD ERROR', error); // TEMP 🐷

          const err = error.mesage || '<no-further-info>';
          const msg = `Failed while pulling '${file.path}' from '${origin}'. ${err}`;
          addError(msg);
        }
      }),
    );

    const ok = errors.length === 0;
    if (ok) {
      // Switch the target directory to the downloaded result set.
      await fs.remove(targetDir);
      await fs.ensureDir(fs.dirname(targetDir));
      await fs.rename(tmpTarget, targetDir);
    }

    if (!silent) {
      const bytes = (await fs.size.dir(targetDir)).toString({ round: 0 });
      const size = count > 0 ? `(${log.yellow(bytes)})` : '';
      log.info.gray(`${log.green(count)} files pulled ${size}`);
      logger.errors(errors);
      logger.hr().newline();
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
