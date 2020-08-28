import { t } from './common';
export * from '../../common/types';
export * from './api/types';

import { IMainProps } from './components/Main';

/**
 * Harness
 * (the component harnessing the "deb module")
 */

export type HarnessView = 'HOST/component' | 'HOST/module' | '404';
export type HarnessTarget = 'PANEL/right';
export type HarnessData = { host?: HarnessHost };
export type HarnessProps = t.IViewModuleProps<HarnessData, HarnessView, HarnessTarget>;
export type HarnessModule = t.IModule<HarnessProps>;

export type HarnessModuleDef = {
  View: (props?: IMainProps) => JSX.Element;
  init(bus: t.EventBus): HarnessModule;
};

export type HarnessHost = {
  view?: string;
  layout?: HarnessHostLayout;
};

export type HarnessHostLayout = {
  width?: number | string;
  height?: number | string;
};

/**
 * Dev Module
 * (the module that defines the UI tests)
 */

export type DevView = HarnessView;
export type DevData = { host?: HarnessHost };
export type DevProps = t.IViewModuleProps<DevData, DevView>;
export type DevModule = t.IModule<DevProps>;

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
