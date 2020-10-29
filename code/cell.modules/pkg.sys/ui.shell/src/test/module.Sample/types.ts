import { t } from '../../common';
export * from '../../common/types';

export type TmplView = 'Default' | '404';
export type TmplRegion = 'Main';
export type TmplData = { url?: string };
export type TmplProps = t.IViewModuleProps<TmplData, TmplView, TmplRegion>;
export type TmplModule = t.IModule<TmplProps>;

export type TmplModuleDef = {
  module(bus: t.EventBus): TmplModule;
};
