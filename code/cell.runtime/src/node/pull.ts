import { Bundle } from './Bundle';
import { fs, HttpClient, log, logger, Path, t } from './common';

/**
 * Factory for the [pull] method.
 */
export function pullMethod(args: { cachedir: string }) {
  /**
   * Pull the given bundle.
   */
  const fn: t.RuntimeEnvNode['pull'] = async (input, options = {}) => {
    const { silent } = options;
    const bundle = Bundle(input, args.cachedir);

    if (!silent) {
      const url = bundle.urls.manifest;
      const from = logger.format.url(url.toString());
      const to = Path.trimBase(bundle.cache.dir);
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

    const client = HttpClient.create(bundle.host).cell(bundle.uri);
    const errors: Error[] = [];
    let count = 0;

    const pullList = async () => {
      try {
        const filter = bundle.dir.append('**');
        const list = await client.files.list({ filter });
        return list.body;
      } catch (error) {
        errors.push(error);
        return [];
      }
    };

    const list = await pullList();

    await Promise.all(
      list.map(async (file) => {
        const res = await client.file.name(file.path).download();
        if (typeof res.body === 'object') {
          count++;
          const filename = bundle.dir.path
            ? file.path.substring(bundle.dir.path.length + 1)
            : file.path;
          const path = fs.join(bundle.cache.dir, filename);
          await fs.stream.save(path, res.body as any);
        }
      }),
    );

    if (!silent) {
      const bytes = (await fs.size.dir(bundle.cache.dir)).toString({ round: 0 });
      const size = count > 0 ? `(${log.yellow(bytes)})` : '';
      log.info.gray(`${log.green(count)} files pulled ${size}`);
      logger.errors(errors);
      logger.hr().newline();
    }

    const ok = errors.length === 0;
    return { ok, errors };
  };

  return fn;
}
