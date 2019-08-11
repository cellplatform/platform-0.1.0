import * as React from 'react';

import { Test } from '../test/components/Test';
import { bundler, lastDir, t } from './common';

(async () => {
  const bundleDir = await lastDir('bundle');
  await bundler.prepare({ bundleDir, entries: [entry] });
})();

/**
 * SSR initial HTML
 */
const el = <Test />;
export const entry: t.IBundleEntryElement = { file: 'index.html', el };
