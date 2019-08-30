/**
 * Entry renderer used to produce HTML for SSR by `@platform/react.ssr`
 * See:
 *   - /sample.server/ssr.yml
 */

import * as React from 'react';
import { Test } from './Test';

export default [{ file: 'index.html', el: <Test /> }];
