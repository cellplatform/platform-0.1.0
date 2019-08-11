import { bundler, fs, s3 } from './common';

(async () => {
  const bundleDir = await bundler.lastDir('bundle');
  const version = fs.basename(bundleDir);
  const bucket = 'platform';
  const bucketKey = fs.join('modules/react.ssr/bundle', version);
  await bundler.push(s3).bundle({ bundleDir, bucket, bucketKey, silent: false });
})();
