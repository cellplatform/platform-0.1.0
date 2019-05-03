import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import renderer from '@platform/electron/lib/renderer';
import * as t from '../types';

export * from '../../src/common';
export * from '../../src';
export { Button, ObjectView, Hr } from '@uiharness/ui';
export { t, renderer };
