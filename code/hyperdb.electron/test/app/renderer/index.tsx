import '../../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import { renderer } from '@platform/electron/lib/renderer';
import * as React from 'react';

import { Test } from './Test';

/**
 * [Renderer] entry-point.
 */
const el = <Test />;
renderer.render(el, 'root').then(context => context.log.info('renderer loaded!'));
