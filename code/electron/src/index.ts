import * as path from 'app-root-path';
import * as is from 'electron-is';

export * from './types';
export * from './helpers/ipc/types';
export * from './helpers/logger/types';

export { IpcClient } from './helpers/ipc';
export { is, path };
