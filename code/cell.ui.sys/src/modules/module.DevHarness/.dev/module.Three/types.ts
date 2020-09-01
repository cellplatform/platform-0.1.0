import { t } from '../../common';
export * from '../../../../common/types';

export type ThreeView = 'DEFAULT' | '404' | 'FOO';
export type ThreeTarget = 'PANEL/left' | 'PANEL/right';
export type ThreeData = { title?: string };
export type ThreeProps = t.IViewModuleProps<ThreeData, ThreeView, ThreeTarget>;
export type ThreeModule = t.IModule<ThreeProps>;

export type ThreeModuleDef = {
  init(bus: t.EventBus, parent?: string): ThreeModule;
};

export type ThreeContext = { bus: t.EventBus; module: ThreeModule };
