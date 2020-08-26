import { t } from '../../common';
export * from '../../common/types';

export type TmplView = 'DEFAULT' | '404';
export type TmplData = { foo?: string | number };
export type TmplProps = t.IViewModuleProps<TmplData, TmplView>;
export type TmplModule = t.IModule<TmplProps>;
