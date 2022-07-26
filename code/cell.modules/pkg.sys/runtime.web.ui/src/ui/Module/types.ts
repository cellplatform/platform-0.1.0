import * as t from '../../common/types';

type Id = string;

export type ModuleTheme = 'Light' | 'Dark';
export type ModuleInstance = { bus: t.EventBus<any>; id?: Id };

export type ModuleDebug = {
  logLoader?: boolean;
};
