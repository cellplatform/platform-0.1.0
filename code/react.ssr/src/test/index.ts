export * from '@platform/test';
export * from '../common';

import { fs, t } from '../common';
import { Manifest } from '../manifest';

export const YAML_DIR = fs.resolve('src/test/yml');
export const YAML_MANIFEST = fs.join(YAML_DIR, 'manifest.yml');

export async function testManifest(filename: string = 'manifest.yml') {
  const url = 'https://sfo2.digitaloceanspaces.com/platform/modules/react.ssr/manifest.yml';
  const def = await testManifestDef(filename);
  return Manifest.create({ url, def });
}

export async function testManifestDef(filename: string = 'manifest.yml') {
  const path = fs.join(YAML_DIR, filename);
  const def = await fs.file.loadAndParse<t.IManifest>(path);
  return def;
}
