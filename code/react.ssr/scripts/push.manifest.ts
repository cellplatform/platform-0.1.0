import { bundler, s3 } from './common';

(async () => {
  const bucket = 'platform';
  const source = 'test/manifest.yml';
  const target = 'modules/react.ssr';
  await bundler.push(s3).manifest({ bucket, source, target, silent: false });
})();
