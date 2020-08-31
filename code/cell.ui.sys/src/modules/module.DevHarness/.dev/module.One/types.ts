import { t } from '../../common';
export * from '../../types';

export type OneView = 'DEFAULT' | '404' | 'FOO';
export type OneData = {};
export type OneProps = t.IViewModuleProps<OneData, OneView>;
export type OneModule = t.IModule<OneProps>;

export type SampleOneModuleDef = {
  init(bus: t.EventBus, parent?: string): OneModule;
  dev(bus: t.EventBus): t.DevModule;
};
