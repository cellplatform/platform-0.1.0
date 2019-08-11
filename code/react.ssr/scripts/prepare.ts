import { bundler, s3, fs } from './common';

(async () => {
  bundler.prepare({ bundleDir: 'bundle/0.0.0' });

  /**
   * Push. TEMP 🐷
   */
  const bundleDir = fs.resolve('bundle/0.0.0');
  const bucket = 'platform';
  const bucketKey = 'modules/react.ssr/bundle/0.0.0';
  await bundler.push({ s3, bucket, bundleDir, bucketKey });
})();
