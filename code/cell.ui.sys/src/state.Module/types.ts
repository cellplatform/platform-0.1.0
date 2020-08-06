import { Observable } from 'rxjs';

import * as t from '../common/types';

type O = Record<string, unknown>;
type Node = t.ITreeNode;
type Event = t.Event<O>;

export type ModuleArgs<D extends O> = t.ITreeStateArgs<ITreeNodeModule<D>> & {
  strategy?: t.ModuleStrategy;
};

export type Module = {
  strategies: ModuleStrategies;
  identity: t.TreeIdentity;

  create<D extends O, A extends Event = any>(args?: ModuleArgs<D>): IModule<D, A>;
  register<T extends IModule>(within: T, args: { id: string; name?: string }): Promise<T>;
  events: ModuleEvents;
  publish: ModulePublish;
  subscribe: ModuleSubscribe;
  isModuleEvent(event: t.Event): boolean;
  filter(event: t.ModuleEvent, filter?: t.ModuleFilter): boolean;
  fire(bus: t.FireEvent<t.ModuleEvent>): IModuleFire;
};

/**
 * A module state-tree.
 */
export type IModuleTreeSelection = { id: string; props: t.ITreeViewNodeProps };

export type IModule<D extends O = any, A extends Event = any> = t.ITreeState<
  ITreeNodeModule<D>,
  t.ModuleEvent | A
>;

/**
 * A tree-node that contains details about a module.
 */
export type ITreeNodeModule<D extends O> = t.ITreeNode<
  t.ITreeNodePropsTreeView & t.ITreeNodeModuleProps<D>
>;

/**
 * The way a module is expressed as props within a tree-node.
 */
export type ITreeNodeModuleProps<D extends O = O> = {
  kind?: 'MODULE';
  data?: D;
  view?: string;
};

/**
 * Behavior strategy.
 */
export type ModuleStrategy = (module: IModule<any>) => void;
export type ModuleStrategies = {
  default: ModuleStrategy;
  registration: ModuleStrategy;
};

/**
 * Filter
 */
export type ModuleFilter = (args: ModuleFilterArgs) => boolean;
export type ModuleFilterArgs = {
  id: string;
  namespace: string;
  key: string;
  event: t.ModuleEvent;
};

/**
 * Event Broadcasting
 */
export type ModulePublish = (args: {
  until$?: Observable<any>;
  module: IModule;
  fire: t.FireEvent<any>;
  filter?: t.ModuleFilter;
}) => ModulePublishing;
export type ModulePublishing = t.IDisposable;

export type ModuleSubscribe<T extends Node = Node, A extends Event = any> = (args: {
  until$?: Observable<any>;
  event$: Observable<t.Event>;
  tree: t.ITreeState;
  filter?: t.ModuleFilter;
}) => ModuleSubscription<T, A>;
export type ModuleSubscription<T extends Node = Node, A extends Event = any> = t.IDisposable & {
  tree: t.ITreeState<T, A>;
};

/**
 * Event fire
 */

export type IModuleFire = {
  render: ModuleFireRender;
  selection: ModuleFireSelection;
};

export type ModuleFireRender = (args: ModuleFireRenderArgs) => JSX.Element | null | undefined;
export type ModuleFireRenderArgs = {
  module: string;
  tree: { current?: string; selection?: t.IModuleTreeSelection };
  data?: O;
  view?: string;
};

export type ModuleFireSelection = (args: ModuleFireSelectionArgs) => void;
export type ModuleFireSelectionArgs = {
  root: t.ITreeNode;
  current?: string;
  selected?: string;
};

/**
 * [Events]
 */

export type ModuleEvents = (
  subject: Observable<t.Event> | IModule,
  dispose$?: Observable<any>,
) => IModuleEvents;

export type IModuleEvents = {
  $: Observable<ModuleEvent>;
  changed$: Observable<IModuleChanged>;
  patched$: Observable<IModulePatched>;
  selection$: Observable<IModuleSelection>;
  render$: Observable<IModuleRender>;
  rendered$: Observable<IModuleRendered>;
  filter(fn: ModuleFilter): IModuleEvents;
};

export type ModuleEvent =
  | IModuleRegisterEvent
  | IModuleRegisteredEvent
  | IModuleSelectionEvent
  | IModuleRenderEvent
  | IModuleRenderedEvent
  | IModuleChangedEvent
  | IModulePatchedEvent
  | IModuleDisposedEvent;

export type IModuleRegisterEvent = {
  type: 'Module/register';
  payload: IModuleRegister;
};
export type IModuleRegister = {
  cid: string; // Callback identifier.
  module: string; // ID (either "id" or "namespace:id")
  name?: string; // Display name.
};

export type IModuleRegisteredEvent = {
  type: 'Module/registered';
  payload: IModuleRegistered;
};
export type IModuleRegistered = {
  cid: string; // Callback identifier.
  module: string;
};

export type IModuleSelectionEvent<D extends O = any> = {
  type: 'Module/selection';
  payload: IModuleSelection<D>;
};
export type IModuleSelection<D extends O = any> = {
  module: string;
  tree: { current?: string; selection?: IModuleTreeSelection };
  data?: D;
  view?: string;
};

export type IModuleRenderEvent<D extends O = any> = {
  type: 'Module/render';
  payload: IModuleRender<D>;
};
export type IModuleRender<D extends O = any> = {
  module: string;
  tree: { current?: string; selection?: IModuleTreeSelection };
  data: D;
  view: string;
  render(el: JSX.Element | null): void;
};
export type IModuleRenderedEvent = {
  type: 'Module/rendered';
  payload: IModuleRendered;
};
export type IModuleRendered = { module: string; el: JSX.Element | null };

export type IModuleChangedEvent = {
  type: 'Module/changed';
  payload: IModuleChanged;
};
export type IModuleChanged = { module: string; change: t.ITreeStateChanged };

export type IModulePatchedEvent = {
  type: 'Module/patched';
  payload: IModulePatched;
};
export type IModulePatched = { module: string; patch: t.ITreeStatePatched };

export type IModuleDisposedEvent = {
  type: 'Module/disposed';
  payload: IModuleDisposed;
};
export type IModuleDisposed = { module: string };
