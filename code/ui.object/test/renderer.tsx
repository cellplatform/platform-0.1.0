import '@babel/polyfill';
import '../node_modules/@platform/css/reset.css';
import { renderer } from '@platform/electron/lib/renderer';

import * as React from 'react';
import { Test } from '../src/components/Test';

/**
 * [Renderer] entry-point.
 */
renderer.render(<Test />, 'root');
