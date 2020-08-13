import * as React from 'react';
import { Observable } from 'rxjs';

import * as t from '../common/types';

type S = string;
type O = Record<string, unknown>;
type N = t.ITreeNode;
type E = t.ModuleEvent;
type P = t.IModuleProps;

export type ModuleArgs<T extends P> = t.ITreeStateArgs<IModuleNode<T>> & {
  event$?: Observable<t.Event>; // Global event-bus.
};

export type Module = {
  identity: t.TreeIdentity;
  Query: t.TreeQuery;
  Context: React.Context<any>;

  create<T extends P>(args?: ModuleArgs<T>): IModule<T>;

  register<T extends P>(parent: IModule<any>): ModuleRegister<T>;

  publish(args: ModulePublishArgs): ModulePublishResponse;

  subscribe<T extends N = N>(args: ModuleSubscribeArgs<T>): ModuleSubscribeResponse<T>;

  filter(event: t.ModuleEvent, filter?: t.ModuleFilter): boolean;

  provider<T extends O>(context: T): React.FunctionComponent;

  events: ModuleGetEvents;

  fire(next: t.FireEvent<E>): IModuleFire;

  isModuleEvent(event: t.Event): boolean;

  request<M extends t.IModule = t.IModule>(
    fire: t.FireEvent<E>,
    id: string,
  ): t.ModuleRequestResponse<M>;
};

/**
 * Registration.
 */

export type ModuleRegister<T extends P> = {
  add: (args: ModuleRegisterArgs<T>) => ModuleRegistration<T>;
};

export type ModuleRegisterArgs<T extends P> = {
  id: string;
  treeview?: string | t.ITreeviewNodeProps;
  view?: T['view'];
  data?: T['data'];
};
export type ModuleRegistration<T extends P> = {
  id: string;
  module: t.IModule<T>;
  path: string;
};

/**
 * A module state-tree.
 */
export type IModule<T extends P = P> = t.ITreeState<IModuleNode<T>, t.ModuleEvent>;

/**
 * A tree-node that contains details about a module.
 */
export type IModuleNode<T extends P> = t.ITreeNode<T>;
export type IModuleTreeSelection = { id: string; props: t.ITreeviewNodeProps };

/**
 * The way a module is expressed as props within a tree-node.
 */
export type IModuleProps<D extends O = O, V extends S = S> = {
  kind?: 'MODULE';
  data?: D;
  view?: V;
  treeview?: t.ITreeviewNodeProps;
};

/**
 * Filter.
 */
export type ModuleFilter = (args: ModuleFilterArgs) => boolean;
export type ModuleFilterArgs = {
  id: string;
  namespace: string;
  key: string;
  event: t.ModuleEvent;
};

/**
 * Event Broadcasting.
 */
export type ModulePublishArgs = {
  until$?: Observable<any>;
  module: IModule;
  fire: t.FireEvent<any>;
  filter?: t.ModuleFilter;
};
export type ModulePublishResponse = t.IDisposable;

export type ModuleSubscribeArgs<T extends N = N> = {
  until$?: Observable<any>;
  event$: Observable<t.Event>;
  tree: t.ITreeState<T, E>;
  filter?: t.ModuleFilter;
};
export type ModuleSubscribeResponse<T extends N = N> = t.IDisposable & { tree: t.ITreeState<T, E> };

/**
 * Event Bus (fire).
 */
export type IModuleFire = {
  render: ModuleFireRender;
  selection: ModuleFireSelection;
  request<M extends t.IModule = t.IModule>(id: string): t.ModuleRequestResponse<M>;
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

export type ModuleRequestResponse<M extends IModule = IModule> = {
  module?: M;
  path: string;
};

/**
 * Event helpers
 */

export type ModuleGetEvents = (
  subject: Observable<t.Event> | t.IModule<any>,
  dispose$?: Observable<any>,
) => IModuleEvents;

export type IModuleEvents = {
  $: Observable<ModuleEvent>;
  childRegistered$: Observable<IModuleChildRegistered>;
  childDisposed$: Observable<IModuleChildDisposed>;
  changed$: Observable<IModuleChanged>;
  patched$: Observable<IModulePatched>;
  selection$: Observable<IModuleSelection>;
  render$: Observable<IModuleRender>;
  rendered$: Observable<IModuleRendered>;
  filter(fn: ModuleFilter): IModuleEvents;
};

/**
 * [Events]
 */

export type ModuleEvent =
  | IModuleChildRegisteredEvent
  | IModuleChildDisposedEvent
  | IModuleSelectionEvent
  | IModuleRenderEvent
  | IModuleRenderedEvent
  | IModuleChangedEvent
  | IModulePatchedEvent
  | IModuleRequestEvent;

export type IModuleChildRegisteredEvent = {
  type: 'Module/child/registered';
  payload: IModuleChildRegistered;
};
export type IModuleChildRegistered = { module: string; path: string };

export type IModuleChildDisposedEvent = {
  type: 'Module/child/disposed';
  payload: IModuleChildDisposed;
};
export type IModuleChildDisposed = { module: string; path: string };

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
  handled: boolean;
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

export type IModuleRequestEvent = {
  type: 'Module/request';
  payload: IModuleRequest;
};
export type IModuleRequest = {
  module: string;
  response<T extends P = P>(args: { module: t.IModule<T>; path: string }): void;
};
