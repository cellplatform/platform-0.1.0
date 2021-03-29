import { t } from '../../common';
export * from '../../common/types';

export type FinderView = 'DEFAULT' | '404';
export type FinderData = { foo?: string | number };
export type FinderProps = t.IViewModuleProps<FinderData, FinderView>;
export type FinderModule = t.IModule<FinderProps>;

export type FinderModuleDef = {
  init(bus: t.EventBus, parent?: string): FinderModule;
};
