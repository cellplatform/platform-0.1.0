import { bundler, log, s3, http, SECRET } from './common';

(async () => {
  // Push to S3
  const bucket = 'platform';
  const source = 'test/manifest.yml';
  const target = 'modules/react.ssr';
  await bundler.push(s3).manifest({ bucket, source, target, silent: false });

  // Reset the server's cache.
  log.info.gray('Resetting cache...');
  const url = `http://localhost:3000/.update`;
  const headers = { authorization: SECRET };
  await http.post(url, undefined, { headers });
  log.info.green('Manifest cache reset');
  log.info();
})();
