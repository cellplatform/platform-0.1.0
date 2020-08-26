import { t } from './common';
export * from '../../common/types';

import { IMainProps } from './components/Main';

export type HarnessView = 'DEFAULT' | 'TREE' | '404';
export type HarnessData = { foo?: string | number };
export type HarnessProps = t.IViewModuleProps<HarnessData, HarnessView>;
export type HarnessModule = t.IModule<HarnessProps>;

export type HarnessModuleDef = {
  Main: (props?: IMainProps) => JSX.Element;
  init(bus: t.EventBus): HarnessModule;
};

/**
 * [EVENTS]
 */

export type HarnessEvent = IHarnessAddEvent;
export type HarnessEventPublic = IHarnessAddEvent;

export type IHarnessAddEvent = {
  type: 'Harness/add';
  payload: IHarnessAdd;
};
export type IHarnessAdd = { module: string };
