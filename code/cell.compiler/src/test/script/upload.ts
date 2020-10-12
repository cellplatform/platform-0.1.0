import { fs, t, Uri } from '../common';
import { configuration, Webpack } from '../config';

(async () => {
  // Uri.create.cell(Uri.cuid(), 'A1')

  const config = configuration();

  const ns = 'ckg2nl70400001wethqd5e0ry';

  const args: t.WebpackUploadArgs = {
    host: 'localhost:5000',
    sourceDir: fs.resolve('./dist'),
    targetCell: Uri.create.cell(ns, 'A2'),
    targetDir: config.toObject().name,
    // silent: true,
  };

  console.log('upload args:', args);

  const res = await Webpack.upload(args);

  console.log('-------------------------------------------');
  console.log('bytes', res.bytes);
  console.log('urls', res.urls);
})();
