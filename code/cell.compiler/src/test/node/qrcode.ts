import qrcode from 'qrcode';
import { fs } from '@platform/fs';

const IS_CLOUD = Boolean(process.env.VERCEL_URL);
const TMP = IS_CLOUD ? '/tmp' : fs.resolve('./tmp');

(async () => {
  const url = 'https://news.ycombinator.com/';
  const code = await qrcode.toString(url);

  console.log(url);
  console.log(code);

  console.log('-------------------------------------------');
  // const tmp = fs.resolve('./tmp');
  await fs.ensureDir(TMP);

  const files = await fs.readdir(TMP);
  const path = fs.join(TMP, 'tmp.run', `foo-${files.length + 1}`);
  console.log('TMP', TMP);
  console.log('path', path);

  // await fs.writeFile(path, path);
  // console.log();

  try {
    console.log('__CELL_ENV__', __CELL_ENV__);
  } catch (error) {
    console.log('error', error);
  }

  console.log();
  await __webpack_init_sharing__('default');
  console.log('__webpack_init_sharing__', __webpack_init_sharing__);
  console.log('__webpack_share_scopes__', __webpack_share_scopes__);
})();
