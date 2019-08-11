import * as React from 'react';

import { Test } from '../test/components/Test';
import { bundler, lastDir, log, t } from './common';

(async () => {
  const bundleDir = await lastDir('bundle');
  const res = await bundler.prepare({ bundleDir, entries: [entry] });
  log.info();
  log.info.gray(res.manifest.size);
  res.manifest.files.forEach(file => {
    log.info.gray(` - ${log.green(file)}`);
  });
  log.info();
})();

/**
 * SSR initial HTML
 */
const el = <Test />;
export const entry: t.IBundleEntryElement = { file: 'index.html', el };
