import qrcode from 'qrcode';
import { fs } from '@platform/fs';

(async () => {
  const url = 'http://localhost:3000';
  const code = await qrcode.toString(url);

  console.log(url);
  console.log(code);

  const tmp = fs.resolve('./tmp');
  await fs.ensureDir(tmp);

  const files = await fs.readdir(tmp);
  const path = fs.join(tmp, `foo-${files.length + 1}`);
  console.log('path', path);

  await fs.writeFile(path, path);
})();
