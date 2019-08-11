import { bundler, fs, lastDir, s3 } from './common';

(async () => {
  const bundleDir = await lastDir('bundle');
  const version = fs.basename(bundleDir);
  const bucket = 'platform';
  const bucketKey = fs.join('modules/react.ssr/bundle', version);
  await bundler.push({ s3, bundleDir, bucket, bucketKey, silent: false });
})();
