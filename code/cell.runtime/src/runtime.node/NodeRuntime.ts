import { fs, HttpClient, log, logger, PATH, Path, Schema, t } from './common';
import { invoke } from './invoke';

/**
 * Runtime environment for executing bundles on [node-js].
 */
export const NodeRuntime = (args: { host: string; uri: string; dir?: string }) => {
  const { uri, host } = args;
  const dir = Path.dir(args.dir);
  const client = HttpClient.create(host).cell(uri);

  const runtime = {
    get url() {
      const urls = Schema.urls(host).cell(uri);
      return {
        files: urls.files.list.query({ filter: `${dir.path}/**` }),
        manifest: urls.file.byName(Path.dir(dir.path).append(PATH.MANIFEST_FILENAME)),
      };
    },

    get cachedir() {
      const hostname = host
        .replace(/^http:\/\//, '')
        .replace(/^https:\/\//, '')
        .replace(/\:/g, '-');
      return fs.join(PATH.CACHE_DIR, hostname, uri.replace(/\:/g, '-'));
    },

    /**
     * Determine if the bundle files exist locally.
     */
    async existsLocally() {
      return fs.pathExists(dir.prepend(runtime.cachedir));
    },

    /**
     * Download the bundle locally from the network.
     */
    async pull(options: { silent?: boolean } = {}) {
      const { silent } = options;
      const cachedir = runtime.cachedir;
      const bundleDir = dir.prepend(cachedir);
      await fs.remove(bundleDir);

      if (!silent) {
        const url = runtime.url.manifest;
        const from = logger.format.url(url.toString());
        const to = Path.trimBase(bundleDir);
        const table = log.table({ border: false });

        const add = (key: string, value: string) => {
          table.add([log.gray(` • ${log.white(key)}`), log.gray(value)]);
        };
        add('from', from);
        add('to', to);

        log.info();
        log.info.gray(`pulling bundle`);
        table.log();
        log.info();
      }

      const errors: Error[] = [];
      let count = 0;

      const pullList = async () => {
        try {
          const list = await client.files.list({ filter: dir.append('**') });
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
            const path = fs.join(cachedir, file.path);
            await fs.stream.save(path, res.body as any);
          }
        }),
      );

      if (!silent) {
        const bytes = (await fs.size.dir(bundleDir)).toString({ round: 0 });
        const size = count > 0 ? `(${log.yellow(bytes)})` : '';
        log.info.gray(`${log.green(count)} files pulled ${size}`);
        logger.errors(errors);
        logger.hr().newline();
      }

      const ok = errors.length === 0;
      return { ok, errors };
    },

    /**
     * Pull and execute.
     */
    async run(options: { pull?: true; silent?: boolean } = {}) {
      const { silent } = options;
      const cachedir = runtime.cachedir;
      const exists = await runtime.existsLocally();
      const isPullRequired = !exists || options.pull;

      if (isPullRequired) {
        const { ok, errors } = await runtime.pull({ silent });
        if (!ok) {
          return { ok, errors };
        }
      }

      const manifestPath = fs.join(dir.prepend(cachedir), PATH.MANIFEST_FILENAME);
      if (!(await fs.pathExists(manifestPath))) {
        throw new Error(`A bundle manifest does not exist [${host}/${uri}].`);
      }
      const manifest = (await fs.readJson(manifestPath)) as t.BundleManifest;

      if (!silent) {
        const size = fs.size.toString(manifest.bytes, { round: 0 });
        const table = log.table({ border: false });
        const add = (key: string, value: string) => {
          table.add([log.green(key), log.gray(value)]);
        };

        add('runtime  ', 'node');
        add('target', `${manifest.target} (${manifest.mode})`);
        add('source ', logger.format.url(runtime.url.files.toString()));
        add('entry', manifest.entry);
        add('size', `${log.yellow(size)} (${manifest.files.length} files)`);

        log.info();
        table.log();
        logger.hr().newline();
      }

      const { ok, errors } = await invoke({ dir: dir.prepend(cachedir), silent });
      return { ok, errors };
    },
  };

  return runtime;
};
