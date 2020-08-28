import { t } from '../common';

import { IMainProps } from '../components/Main';

export type HarnessDef = {
  View: (props?: IMainProps) => JSX.Element;
  init(bus: t.EventBus): HarnessModule;
  dev: t.DevFactory;
};

/**
 * Harness
 * (the module that "harnesses" another "module under development")
 */

export type HarnessView = 'HOST/component' | 'HOST/module' | '404';
export type HarnessTarget = 'PANEL/right';
export type HarnessData = { host?: t.DevHost };
export type HarnessProps = t.IViewModuleProps<HarnessData, HarnessView, HarnessTarget>;
export type HarnessModule = t.IModule<HarnessProps>;

/**
 * [Events]
 */

export type HarnessEvent = IHarnessAddEvent;
export type HarnessEventPublic = IHarnessAddEvent;

export type IHarnessAddEvent = {
  type: 'Harness/add';
  payload: IHarnessAdd;
};
export type IHarnessAdd = { module: string };
