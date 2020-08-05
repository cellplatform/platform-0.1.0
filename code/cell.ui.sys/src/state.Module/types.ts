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
  register<T extends IModule>(within: T, payload: IModuleRegister): Promise<T>;
  events: ModuleEvents;
  publish: ModulePublish;
  subscribe: ModuleSubscribe;
  isModuleEvent(event: t.Event): boolean;
  filter(event: t.ModuleEvent, filter?: t.ModuleFilter): boolean;
};

/**
 * A module state-tree.
 */
export type IModule<D extends O = any, A extends Event = any> = t.ITreeState<
  ITreeNodeModule<D>,
  t.ModuleEvent | A
>;

/**
 * A tree-node that contains details about a module.
 */
export type ITreeNodeModule<D extends O> = t.ITreeNode<
  t.ITreeNodePropsTreeView & t.ITreeNodePropsModule<D>
>;

/**
 * The way a module is expressed as props within a tree-node.
 */
export type ITreeNodePropsModule<D extends O = O> = {
  data: D;
  view: string;
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
 * Broadcasting
 */
export type ModulePublish = (args: {
  module: IModule;
  fire: t.FireEvent<any>;
  filter?: t.ModuleFilter;
  until$?: Observable<any>;
}) => ModulePublishing;
export type ModulePublishing = t.IDisposable;

export type ModuleSubscribe<T extends Node = Node, A extends Event = any> = (args: {
  event$: Observable<t.Event>;
  tree: t.ITreeState;
  filter?: t.ModuleFilter;
  until$?: Observable<any>;
}) => ModuleSubscription<T, A>;
export type ModuleSubscription<T extends Node = Node, A extends Event = any> = t.IDisposable & {
  tree: t.ITreeState<T, A>;
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
  render$: Observable<IModuleRender>;
  rendered$: Observable<IModuleRendered>;
  filter(fn: ModuleFilter): IModuleEvents;
};

export type ModuleEvent =
  | IModuleRegisterEvent
  | IModuleRegisteredEvent
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
  id: string; // ID (either "id" or "namespace:id")
  name?: string; // Display name.
};

export type IModuleRegisteredEvent = {
  type: 'Module/registered';
  payload: IModuleRegistered;
};
export type IModuleRegistered = { id: string };

export type IModuleRenderEvent<D extends O = any> = {
  type: 'Module/render';
  payload: IModuleRender<D>;
};
export type IModuleRender<D extends O = any> = {
  id: string;
  tree: { selected?: string; current?: string; node?: t.ITreeNode };
  data: D;
  view: string;
  render(el: JSX.Element | null): void;
};
export type IModuleRenderedEvent = {
  type: 'Module/rendered';
  payload: IModuleRendered;
};
export type IModuleRendered = {
  id: string;
  el: JSX.Element | null;
};

export type IModuleChangedEvent = {
  type: 'Module/changed';
  payload: IModuleChanged;
};
export type IModuleChanged = { id: string; change: t.ITreeStateChanged };

export type IModulePatchedEvent = {
  type: 'Module/patched';
  payload: IModulePatched;
};
export type IModulePatched = { id: string; patch: t.ITreeStatePatched };

export type IModuleDisposedEvent = {
  type: 'Module/disposed';
  payload: IModuleDisposed;
};
export type IModuleDisposed = { id: string };
