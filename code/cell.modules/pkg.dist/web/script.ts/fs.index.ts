import { t } from '../src/common';
import { fs } from '@platform/fs';

/**
 * Generate URLs.
 */
async function parseFolder(dir: string) {
  const base = fs.resolve('.');
  const pattern = fs.join(base, dir, '*');
  let paths = await fs.glob.find(pattern);

  paths = paths.map((path) => path.substring(base.length));
  const photos: t.Photo[] = paths.map((url) => ({ url }));

  await fs.writeJson(fs.join(base, dir, 'photos.json'), photos);
  return photos;
}

/**
 * Run.
 */
parseFolder('static/images/montage');
