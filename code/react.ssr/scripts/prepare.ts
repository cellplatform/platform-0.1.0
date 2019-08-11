import { bundler, lastDir, log } from './common';

(async () => {
  const bundleDir = await lastDir('bundle');
  const res = await bundler.prepare({ bundleDir });

  log.info();
  log.info.gray(res.bundle);
  log.info.gray(res.manifest.size);
  res.manifest.files.forEach(file => {
    log.info.gray(` - ${log.green(file)}`);
  });
  log.info();
})();
