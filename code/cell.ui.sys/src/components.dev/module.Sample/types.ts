import { t } from '../../common';
export * from '../../common/types';

export type MyView = 'TREE' | 'DIAGRAM' | 'SAMPLE' | 'TREE_COLUMNS' | '404' | 'FOO';
export type MyData = { foo?: string | number };
export type MyProps = t.IViewModuleProps<MyData, MyView>;
export type MyModule = t.IModule<MyProps>;
export type MyModuleDef = {
  init(bus: t.EventBus, parent?: string): MyModule;
};

export type MyContext = { bus: t.EventBus<any> };
