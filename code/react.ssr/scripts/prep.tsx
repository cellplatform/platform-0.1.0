import * as React from 'react';

import { Test } from '../test/components/Test';
import { bundler, t } from './common';

(async () => {
  const bundleDir = await bundler.lastDir('bundle');
  await bundler.prepare({
    bundleDir,
    entries: [entry],
    promptVersion: true,
  });
})();

/**
 * SSR initial HTML
 */
const el = <Test />;
export const entry: t.IBundleEntryElement = { file: 'index.html', el };
