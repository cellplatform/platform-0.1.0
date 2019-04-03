import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import * as t from '../types';

export * from '@platform/cli.spec';
export { Npm } from '../../src/renderer';
export { renderer } from '@platform/electron/lib/renderer';
export { ObjectView, Button, Hr, Shell } from '@uiharness/ui';
export { css, color, GlamorValue } from '@platform/react';

export { t };

export const COLORS = {
  DARK: '#293042', // Inky blue/black.
};
