import { t } from '../common';
export * from '../types';

export type FinderView = 'DEFAULT';
export type FinderData = { foo?: string | number };
export type FinderProps = t.IModuleProps<FinderData, FinderView>;
export type FinderModule = t.IModule<FinderProps>;
