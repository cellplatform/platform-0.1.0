import { exec } from '@platform/exec';

import { DEFAULT, fs, HttpClient, log, PATH, t, logger } from '../node/common';

const MANIFEST = DEFAULT.FILE.JSON.INDEX;

/**
 * Runtime host for executing bundles on [node-js].
 */
export const NodeRuntime = (args: { host: string; uri: string; dir?: string }) => {
  const { uri, host } = args;
  const base = fs.resolve('.');
  const dir = (args.dir || '').trim().replace(/\/*$/, '');
  const cachedir = fs.join(PATH.cachedir, 'runtime.node', uri.replace(/\:/, '-'));
  const client = HttpClient.create(host).cell(args.uri);

  const prefixDir = (path: string) => (dir ? `${dir}/${path}` : path);
  const suffixDir = (path: string) => (dir ? `${path}/${dir}` : path);

  const runtime = {
    async exists() {
      return fs.pathExists(suffixDir(cachedir));
    },

    async pull(options: { silent?: boolean } = {}) {
      const { silent } = options;

      if (!silent) {
        log.info();
        log.info.gray(`Pulling bundle:`);
        log.info.gray(` • ${host}`);
        log.info.gray(` • ${logger.format.uri(uri)}`);
        log.info();
      }

      const dir = suffixDir(cachedir);
      await fs.remove(dir);

      const list = await client.files.list({ filter: prefixDir('**') });
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
        const size = (await fs.size.dir(dir)).toString();
        log.info.gray(`${log.green(list.body.length)} files pulled (${log.yellow(size)})`);
        log.info.gray(dir.substring(base.length + 1));
        log.info();
      }
    },

    /**
     * Pull and run.
     */
    async run(options: { pull?: boolean; silent?: boolean } = {}) {
      const { silent } = options;

      const exists = await runtime.exists();
      if (!exists || options.pull) {
        await runtime.pull({ silent });
      }

      const manifestPath = fs.join(suffixDir(cachedir), MANIFEST);
      if (!(await fs.pathExists(manifestPath))) {
        throw new Error(`A bundle manifest does not exist [${host}/${uri}].`);
      }

      const manifest = (await fs.readJson(manifestPath)) as t.BundleManifest;

      const cmd = `node ${manifest.entry}`;
      const cwd = suffixDir(cachedir);
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
