import { t } from '../common';

export type HarnessDef = {
  dev: t.DevFactory;
  module(bus: t.EventBus, options?: { register?: true | { parent?: string } }): HarnessModule;
};

/**
 * Harness
 * (the module that "harnesses" another "module under development")
 */

export type HarnessView = 'Host' | 'Folder' | 'Null' | '404';
export type HarnessRegion = 'Main' | 'Sidebar';
export type HarnessProps = t.IViewModuleProps<HarnessData, HarnessView, HarnessRegion>;
export type HarnessModule = t.IModule<HarnessProps>;

/**
 * The data structures nodes within a Harness can take.
 */
export type HarnessData = HarnessDataRoot | HarnessDataComponent | HarnessDataFolder;

export type HarnessDataRoot = {
  kind: 'harness.root';
  shell: string;
};

export type HarnessDataComponent = {
  kind: 'harness.component';
  host?: t.IDevHost;
};

export type HarnessDataFolder = {
  kind: 'harness.folder';
  folder: t.IDevFolder;
};

/**
 * [Events]
 */

export type HarnessEvent = IHarnessAddEvent | IHarnessRenderEvent;
export type HarnessEventPublic = IHarnessAddEvent;

/**
 * Register a new module within the harness.
 */
export type IHarnessAddEvent = {
  type: 'Harness/add';
  payload: IHarnessAdd;
};
export type IHarnessAdd = { module: string };

/**
 * Invoke the renderer logic on the harness.
 */
export type IHarnessRenderEvent = {
  type: 'Harness/render';
  payload: IHarnessRender;
};
export type IHarnessRender = {
  harness: string;
  module: string;
  view?: string;
  host?: t.IDevHost;
};
