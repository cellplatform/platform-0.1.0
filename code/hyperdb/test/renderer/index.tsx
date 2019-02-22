import '../../node_modules/@uiharness/dev/css/normalize.css';

import * as React from 'react';
import { renderer } from '@platform/electron/lib/renderer';
import { Test } from './Test';

/**
 * [Renderer] entry-point.
 */
const el = <div>Foo</div>;
// const el = <Test/>
renderer.render(el, 'root').then(context => context.log.info('renderer loaded!'));
