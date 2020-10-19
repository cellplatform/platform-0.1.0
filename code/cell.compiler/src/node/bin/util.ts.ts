import { fs, log, t } from '../common';
import { logger } from './util';
import { exec } from '@platform/exec';

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
    const cachepath = fs.join(cachedir, ts.toHash(configfile).toString());
    const exists = fs.pathExists;
    const readFileHash = async (path: string) => ts.toHash(await readFile(path));
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

  toHash(text: string) {
    // Based on: https://stackoverflow.com/a/8831937

    // console.log('text', text);

    if (text.length == 0) {
      return '';
    } else {
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer.
      }
      return hash.toString();
    }
  },
};
