import { t, fs } from '../main/common';

export const TestSample = {
  async manifest(change: { namespace?: string; version?: string } = {}) {
    const json = await fs.readJson(fs.join(__dirname, 'sample/ModuleManifest.json'));
    const manifest = json as t.ModuleManifest;
    Object.keys(change).forEach((key) => (manifest.module[key] = change[key]));
    return manifest;
  },
};
