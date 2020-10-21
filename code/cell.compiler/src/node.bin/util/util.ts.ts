import { fs, log, t } from '../common';
import { logger } from './util.logger';
import { exec } from '@platform/exec';
import { toHash } from './util.hash';

/**
 * Helpers for working with typescript transpiling.
 */
export const ts = {
  async build() {
    const cwd = fs.resolve('.');
    const res = await exec.command(`yarn build`).run({ cwd, silent: true });
    if (!res.ok) {
      const err = `Failed to transpile typescript into ${log.white('/lib/')}`;
      logger.errorAndExit(res.code, err);
    }
  },

  buildhash(configfile: string) {
    const cachedir = fs.resolve('./node_modules/.cache/cell.compiler/lib.build');
    const cachepath = fs.join(cachedir, toHash(configfile).toString());
    const exists = fs.pathExists;
    const readFileHash = async (path: string) => toHash(await readFile(path));
    const readFile = async (path: string) =>
      (await exists(path)) ? (await fs.readFile(path)).toString() : '';

    const api = {
      configfile,
      cachepath,
      async save() {
        await fs.ensureDir(cachedir);
        await fs.writeFile(cachepath, await readFileHash(configfile));
      },
      async read() {
        return {
          last: await readFile(cachepath),
          current: await readFileHash(configfile),
        };
      },
      async changed() {
        const hash = await api.read();
        return hash.current !== hash.last;
      },
    };

    return api;
  },
};
