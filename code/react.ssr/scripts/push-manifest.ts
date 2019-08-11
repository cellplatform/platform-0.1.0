import { bundler, fs, lastDir, s3 } from './common';

(async () => {
  const bundleDir = await lastDir('bundle');
  const version = fs.basename(bundleDir);
  const bucket = 'platform';
  const source = 'test/manifest.yml';
  const target = 'modules/react.ssr';
  await bundler.push.manifest({ s3, bucket, source, target, silent: false });
})();
