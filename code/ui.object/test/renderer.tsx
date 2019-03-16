import { renderer } from '@platform/electron/lib/renderer';
import * as React from 'react';
import { Test } from './components/Test';

/**
 * [Renderer] entry-point.
 */
renderer.render(<Test />, 'root');
