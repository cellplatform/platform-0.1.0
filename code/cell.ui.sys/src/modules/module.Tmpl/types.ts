import { t } from '../../common';
export * from '../../common/types';

export type TmplView = 'Default' | '404';
export type TmplTarget = 'Panel';
export type TmplData = { foo?: string | number };
export type TmplProps = t.IViewModuleProps<TmplData, TmplView, TmplTarget>;
export type TmplModule = t.IModule<TmplProps>;

export type TmplModuleDef = {
  module(bus: t.EventBus): TmplModule;
};
