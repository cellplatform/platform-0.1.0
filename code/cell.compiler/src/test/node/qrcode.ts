import qrcode from 'qrcode';
import { fs } from '@platform/fs';

(async () => {
  const url = 'https://news.ycombinator.com/';
  const code = await qrcode.toString(url);

  console.log(url);
  console.log(code);

  console.log('-------------------------------------------');
  const tmp = fs.resolve('./tmp');
  await fs.ensureDir(tmp);

  const files = await fs.readdir(tmp);
  const path = fs.join(tmp, `foo-${files.length + 1}`);
  console.log('path', path);

  await fs.writeFile(path, path);
  console.log();

  try {
    // @ts-ignore
    console.log('__CELL_ENV__', __CELL_ENV__);
  } catch (error) {
    // return {};
    console.log('error', error);
  }
})();
