import qrcode from 'qrcode';
import { fs } from '@platform/fs';

const IS_CLOUD = Boolean(process.env.VERCEL_URL);
const TMP = IS_CLOUD ? '/tmp' : fs.resolve('./tmp');

(async () => {
  const URL = 'https://news.ycombinator.com/';
  const code = await qrcode.toString(URL);

  console.log(URL);
  console.log(code);

  // const tmp = fs.resolve('./tmp');
  // const files = await fs.readdir(TMP);
  // const path = fs.join(TMP, 'tmp.run', `foo-${files.length + 1}`);
  // await fs.ensureDir(fs.dirname(path));
  // await fs.writeFile(path, path);
  // console.log('path', path);

  try {
    console.log('__CELL_ENV__', __CELL_ENV__);
  } catch (error) {
    console.log('error', error);
  }
})();
