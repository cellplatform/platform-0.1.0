export * from '@platform/test';
export * from '../common';

import { fs, t } from '../common';
import { Manifest } from '../manifest';

export const YAML_DIR = fs.resolve('src/test/yml');
export const YAML_MANIFEST = fs.join(YAML_DIR, 'manifest.yml');

export async function getTestManifest(filename: string = 'manifest.yml') {
  const path = fs.join(YAML_DIR, filename);
  const def = await fs.file.loadAndParse<t.IManifest>(path);
  return Manifest.create({ def });
}
