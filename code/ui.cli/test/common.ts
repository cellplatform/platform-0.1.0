import '../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import * as t from './types';
import renderer from '@platform/electron/lib/renderer';

export * from '../src/common';
export { Button, ObjectView, Hr } from '@uiharness/ui';
export { t, renderer };
