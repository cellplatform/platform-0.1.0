import * as React from 'react';
import { Observable } from 'rxjs';

import * as t from '../common/types';

type S = string;
type O = Record<string, unknown>;
type N = t.ITreeNode;
type B = t.EventBus<any>;
type E = t.ModuleEvent;
type P = t.IModuleProps;
type AnyProps = t.IModulePropsAny;

export type ModuleArgs<T extends P> = t.ITreeStateArgs<IModuleNode<T>> & {
  bus: B; // Global event-bus.
  treeview?: string | t.ITreeviewNodeProps;
  view?: T['view'];
  data?: T['data'];
};

/**
 * The definition entry-point for a module.
 * This is what is explored by module authors.
 */
export type IModuleDef = {
  initialize(bus: t.EventBus, parent?: string): void;
};

/**
 * Static module methods.
 */
export type Module = {
  create<T extends P>(args?: ModuleArgs<T>): IModule<T>;

  Identity: t.TreeIdentity;
  Query: t.TreeQuery;

  Context: React.Context<any>;
  provider<T extends O>(context: T): React.FunctionComponent;

  events<T extends P>(
    subject: Observable<t.Event> | t.IModule,
    dispose$?: Observable<any>,
  ): IModuleEvents<T>;

  isModuleEvent(event: t.Event): boolean;

  fire(bus: B): IModuleFire;
  register(bus: B, module: t.IModule, parent?: string): t.ModuleRegistration;
};

/**
 * Registration.
 */
export type ModuleRegistration = {
  ok: boolean;
  module: t.IModule;
  parent?: t.IModule;
};

/**
 * A module state-tree.
 */
export type IModule<T extends P = AnyProps> = t.ITreeState<IModuleNode<T>, t.ModuleEvent>;

/**
 * A tree-node that contains details about a module.
 */
export type IModuleNode<T extends P> = t.ITreeNode<T>;
export type IModuleSelectionTree = { id: string; props: t.ITreeviewNodeProps };

/**
 * The way a module is expressed as props within a tree-node.
 */
export type IModuleProps<D extends O = O, V extends S = S> = {
  kind?: 'MODULE';
  data?: D;
  view?: V;
  treeview?: t.ITreeviewNodeProps;
};
export type IModulePropsAny = t.IModuleProps<any, any>;

/**
 * Filter.
 */

export type ModuleFilterArgs = {
  module: string;
  namespace: string;
  key: string;
};

export type ModuleFilterEvent = (args: ModuleFilterEventArgs) => boolean;
export type ModuleFilterEventArgs = ModuleFilterArgs & { event: t.ModuleEvent };

export type ModuleFilterView = (args: ModuleFilterViewArgs) => boolean;
export type ModuleFilterViewArgs = ModuleFilterArgs & { view: string };

/**
 * Event Bus (fire).
 */
export type IModuleFire = {
  register(module: t.IModule, parent?: string): t.ModuleRegistration;
  render: ModuleFireRender;
  selection: ModuleFireSelection;
  request<T extends P>(id: string): t.ModuleRequestResponse<T>;
};

export type ModuleFireRender = (args: ModuleFireRenderArgs) => JSX.Element | null | undefined;
export type ModuleFireRenderArgs = {
  module: string;
  selected?: string;
  data?: O;
  view?: string;
};

export type ModuleFireSelection = (args: ModuleFireSelectionArgs) => void;
export type ModuleFireSelectionArgs = {
  root: t.ITreeNode | t.IModule;
  current?: string;
  selected?: string;
};

export type ModuleRequestResponse<T extends P = AnyProps> = {
  module?: t.IModule<T>;
};

/**
 * Event helpers
 */
export type IModuleEvents<T extends P = AnyProps> = {
  $: Observable<ModuleEvent>;
  register$: Observable<IModuleRegister>;
  registered$: Observable<IModuleRegistered>;
  childRegistered$: Observable<IModuleChildRegistered>;
  childDisposed$: Observable<IModuleChildDisposed>;
  changed$: Observable<IModuleChanged>;
  patched$: Observable<IModulePatched>;
  selection$: Observable<IModuleSelection>;
  render$: Observable<IModuleRender>;
  rendered$: Observable<IModuleRendered>;
  render(view?: T['view']): Observable<IModuleRender>;
  filter(fn: ModuleFilterEvent): IModuleEvents;
};

/**
 * [Events]
 */

export type ModuleEvent =
  | IModuleRegisterEvent
  | IModuleRegisteredEvent
  | IModuleChildRegisteredEvent
  | IModuleChildDisposedEvent
  | IModuleSelectionEvent
  | IModuleRenderEvent
  | IModuleRenderedEvent
  | IModuleChangedEvent
  | IModulePatchedEvent
  | IModuleRequestEvent;

export type IModuleRegisterEvent = {
  type: 'Module/register';
  payload: IModuleRegister;
};
export type IModuleRegister = { module: string; parent?: string };

export type IModuleRegisteredEvent = {
  type: 'Module/registered';
  payload: IModuleRegistered;
};
export type IModuleRegistered = { module: string; parent: string };

export type IModuleChildRegisteredEvent = {
  type: 'Module/child/registered';
  payload: IModuleChildRegistered;
};
export type IModuleChildRegistered = { module: string; child: string };

export type IModuleChildDisposedEvent = {
  type: 'Module/child/disposed';
  payload: IModuleChildDisposed;
};
export type IModuleChildDisposed = { module: string; child: string };

export type IModuleSelectionEvent<D extends O = any> = {
  type: 'Module/selection';
  payload: IModuleSelection<D>;
};
export type IModuleSelection<D extends O = any> = {
  module: string;
  tree: { current?: string; selection?: IModuleSelectionTree };
  data?: D;
  view?: string;
};

export type IModuleRenderEvent<D extends O = any> = {
  type: 'Module/render';
  payload: IModuleRender<D>;
};
export type IModuleRender<D extends O = any> = {
  module: string;
  selected?: string;
  view: string;
  data: D;
  render(el: JSX.Element | null): void;
  handled: boolean;
};
export type IModuleRenderedEvent = {
  type: 'Module/rendered';
  payload: IModuleRendered;
};
export type IModuleRendered = { module: string; view: string; el: JSX.Element | null };

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
  handled: boolean;
  respond<T extends P = AnyProps>(args: { module: t.IModule<T> }): void;
};
