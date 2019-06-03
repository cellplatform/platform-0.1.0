import * as React from 'react';
import renderer from '@platform/electron/lib/renderer';
import { Test } from './components/Test';

/**
 * [Renderer] entry-point.
 *
 * Reference your component(s) here or pull in the [UIHarness]
 * visual testing host.
 */
renderer.render(<Test />, 'root').then(context => context.log.info('renderer loaded!'));
