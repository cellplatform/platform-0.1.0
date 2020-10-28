import { exec } from '@platform/exec';

import { DEFAULT, fs, HttpClient, log, PATH, t, logger, path } from '../node/common';
import { BundleManifest } from '../node/Compiler';

const MANIFEST = DEFAULT.FILE.JSON.INDEX;

/**
 * Runtime environment for executing bundles on [node-js].
 */
export const NodeRuntime = (args: { host: string; uri: string; dir?: string }) => {
  const { uri, host } = args;
  const dir = path.dir(args.dir);
  const cachedir = fs.join(PATH.cachedir, 'runtime.node', uri.replace(/\:/g, '-'));
  const client = HttpClient.create(host).cell(args.uri);

  const runtime = {
    /**
     * Determine if the bundle files exist locally.
     */
    async existsLocally() {
      return fs.pathExists(dir.prepend(cachedir));
    },

    /**
     * Download the bundle locally from the network.
     */
    async pull(options: { silent?: boolean } = {}) {
      const { silent } = options;

      const bundleDir = dir.prepend(cachedir);
      await fs.remove(bundleDir);

      if (!silent) {
        const url = BundleManifest.url(host, uri, dir.path);
        const from = logger.format.url(url.toString());
        const to = path.trimBase(bundleDir);
        const table = log.table({ border: false });

        const add = (key: string, value: string) =>
          table.add([log.gray(` • ${log.white(key)}`), log.gray(value)]);
        add('from', from);
        add('to', to);

        log.info();
        log.info.gray(`Pulling bundle`);
        table.log();
        log.info();
      }

      const list = await client.files.list({ filter: dir.append('**') });
      await Promise.all(
        list.body.map(async (file) => {
          const res = await client.file.name(file.path).download();
          if (typeof res.body === 'object') {
            const path = fs.join(cachedir, file.path);
            await fs.stream.save(path, res.body as any);
          }
        }),
      );

      if (!silent) {
        const size = (await fs.size.dir(bundleDir)).toString();
        log.info.gray(`${log.green(list.body.length)} files pulled (${log.yellow(size)})`);
        logger.hr().newline();
      }
    },

    /**
     * Pull and run.
     */
    async run(options: { pull?: boolean; silent?: boolean } = {}) {
      const { silent } = options;

      const exists = await runtime.existsLocally();
      if (!exists || options.pull) {
        await runtime.pull({ silent });
      }

      const manifestPath = fs.join(dir.prepend(cachedir), MANIFEST);
      if (!(await fs.pathExists(manifestPath))) {
        throw new Error(`A bundle manifest does not exist [${host}/${uri}].`);
      }

      const manifest = (await fs.readJson(manifestPath)) as t.BundleManifest;

      const cmd = `node ${manifest.entry}`;
      const cwd = dir.prepend(cachedir);
      const res = await exec.command(cmd).run({ cwd, silent });

      if (!silent) {
        const code = res.code === 0 ? log.green(0) : log.red(res.code);
        log.info();
        log.info.gray(`status code: ${code}`);

        if (res.errors) {
          const errors = res.errors.map((message) => ({ message }));
          logger.errors(errors);
        }
      }
    },
  };

  return runtime;
};
