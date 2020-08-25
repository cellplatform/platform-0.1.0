import { t } from './common';
export * from '../../common/types';

import { IMainProps } from './components/Main';

export type HarnessView = 'DEFAULT' | 'TREE' | '404';
export type HarnessData = { foo?: string | number };
export type HarnessProps = t.IViewModuleProps<HarnessData, HarnessView>;
export type HarnessModule = t.IModule<HarnessProps>;

export type HarnessModuleDef = t.IModuleDef & {
  Main: (props?: IMainProps) => JSX.Element;
};
