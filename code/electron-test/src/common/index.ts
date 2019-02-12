import * as types from '../types';
export { types };

export * from '../types';
export * from './libs';

export const COLORS = {
  WHITE: '#fff',
  DARK: '#293042', // Inky blue/black.
  YELLOW: '#FBC72F',
  BLUE: '#477AF7',
};

import { renderer } from './libs';

const res = renderer.init<types.MyEvents, types.IMyStore>();
export const ipc = res.ipc;
export const log = res.log;
export const store = res.store;
