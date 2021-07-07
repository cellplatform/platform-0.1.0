import { t, fs, Paths } from '../main/common';
import { exec } from '@platform/exec';

export const TestSample = {
  /**
   * Load manifest.
   */
  async manifest(change: { namespace?: string; version?: string } = {}) {
    const json = await fs.readJson(fs.join(__dirname, 'sample/ModuleManifest.json'));
    const manifest = json as t.ModuleManifest;
    Object.keys(change).forEach((key) => (manifest.module[key] = change[key]));
    return manifest;
  },

  /**
   * Ensure the the runtime bundle exists (running the compiler if required).
   */
  async ensureBundle() {
    const paths = Paths.bundle.sys;
    const dir = paths.source.dir;
    const exists = await fs.pathExists(dir);

    if (!exists) {
      const cwd = paths.project;
      await exec.command('yarn bundle').run({ cwd });
    }

    return { dir, action: !exists ? 'bundled' : 'none' };
  },
};
