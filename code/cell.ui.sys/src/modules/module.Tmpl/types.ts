import { t } from '../../common';
export * from '../../common/types';

export type TmplView = 'DEFAULT' | '404';
export type TmplTarget = 'PANEL';
export type TmplData = { foo?: string | number };
export type TmplProps = t.IViewModuleProps<TmplData, TmplView, TmplTarget>;
export type TmplModule = t.IModule<TmplProps>;

export type TmplModuleDef = {
  init(bus: t.EventBus): TmplModule;
};
