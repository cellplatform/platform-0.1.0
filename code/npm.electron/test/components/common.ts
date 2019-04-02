import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import * as t from '../types';

export { Npm } from '../../src/renderer';
export * from '@platform/cli.spec';
export { renderer } from '@platform/electron/lib/renderer';
export { ObjectView, Button, Hr } from '@uiharness/ui';
export { css, color, GlamorValue } from '@platform/react';

export { t };

export const COLORS = {
  DARK: '#293042', // Inky blue/black.
};
