import { exec } from '@platform/exec';
import { http } from '@platform/http';

import { DEFAULT, fs, HttpClient, log, PATH, t } from '../node/common';

const MANIFEST = DEFAULT.FILE.JSON.INDEX;

/**
 * Runtime host for executing bundles on [node-js].
 */
export const NodeRuntime = (args: { host: string; uri: string; dir?: string }) => {
  const { host, uri } = args;
  const dir = (args.dir || '').trim().replace(/\/*$/, '');
  const cachedir = fs.join(PATH.cachedir, 'runtime.node', uri.replace(/\:/, '-'), dir);
  const client = HttpClient.create(host).cell(uri);
  const prefixPath = (path: string) => (dir ? `${dir}/${path}` : path);

  const saveManifest = async () => {
    const index = prefixPath(DEFAULT.FILE.JSON.INDEX);

    const info = await client.file.name(index).info();
    const url = info.body.urls.download;
    const res = await http.get(url);
    const json = res.json as t.BundleManifest;

    const path = fs.join(cachedir, MANIFEST);
    await fs.ensureDir(cachedir);
    await fs.writeFile(path, JSON.stringify(json, null, '  '));
    return json;
  };

  const runtime = {
    async exists() {
      return fs.pathExists(cachedir);
    },

    async pull() {
      const manifest = await saveManifest();

      // Save files.
      await Promise.all(
        manifest.files.map(async (file) => {
          const res = await client.file.name(prefixPath(file.path)).download();
          const path = fs.join(cachedir, file.path);
          await fs.ensureDir(fs.dirname(path));
          await fs.stream.save(path, res.body);
        }),
      );

      return manifest;
    },

    async run() {
      const manifest = await runtime.pull();

      const cmd = `node ${manifest.entry}`;
      const cwd = cachedir;
      const res = await exec.command(cmd).run({ cwd });

      const code = res.code === 0 ? log.green(0) : log.red(res.code);
      log.info();
      log.info.gray(`status code: ${code}`);
    },
  };

  return runtime;
};
