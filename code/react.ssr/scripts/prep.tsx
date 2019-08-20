import * as React from 'react';

import { Test } from '../test/components/Test';
import { bundler } from './common';

(async () => {
  const bundleDir = await bundler.lastDir('bundle');
  await bundler.prepare({
    bundleDir,
    entries,
  });
})();

/**
 * SSR initial HTML
 */
// const el = <Test />;
// export const entry: bundler.IBundleEntryElement = { file: 'index.html', el };

const entries: bundler.IBundleEntryElement[] = [{ file: 'index.html', el: <Test /> }];
