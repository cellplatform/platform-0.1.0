import { t } from '../common';
export * from '../types';

export type DebugView = 'DEFAULT';
export type DebugData = { foo?: string | number };
export type DebugProps = t.IModuleProps<DebugData, DebugView>;
export type DebugModule = t.IModule<DebugProps>;
