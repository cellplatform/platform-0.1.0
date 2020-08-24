import { t } from '../common';
export * from '../types';

export type MyView = 'TREE' | 'DIAGRAM' | 'SAMPLE' | 'TREE_COLUMNS' | '404' | 'FOO';
export type MyData = { foo?: string | number };
export type MyProps = t.IViewModuleProps<MyData, MyView>;
export type MyModule = t.IModule<MyProps>;

export type MyContext = { bus: t.EventBus<any> };
