import * as React from 'react';

import { Test } from './components/Test';
import { bundler } from '../src';

/**
 * SSR initial HTML
 */
const entries: bundler.IBundleEntryElement[] = [{ file: 'index.html', el: <Test /> }];
export default entries;
