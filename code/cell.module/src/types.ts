import * as React from 'react';
import { Observable } from 'rxjs';

import * as t from './common/types';

type S = string;
type O = Record<string, unknown>;
type B = t.EventBus<any>;
type P = t.IModuleProps;
type AnyProps = t.IModulePropsAny;

export type ModuleArgs<T extends P> = t.ITreeStateArgs<IModuleNode<T>> & {
  bus: B; // Global event-bus.
  treeview?: string | t.ITreeviewNodeProps; // TODO - move under data
  view?: T['view'];
  data?: T['data'];
};

/**
 * The definition entry-point for a module.
 * This is what is explored by module authors.
 */
export type IModuleDef = {
  init(bus: t.EventBus, parent?: string): t.IModule;
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

  fire<T extends P>(bus: B): IModuleFire<T>;
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
export type IModuleFire<T extends P> = {
  register(module: t.IModule<any>, parent?: string): t.ModuleRegistration;
  render: ModuleFireRender<T>;
  selection: ModuleFireSelection;
  request<T extends P>(id: string): t.ModuleRequestResponse<T>;
};

export type ModuleFireRender<T extends P> = (
  args: ModuleFireRenderArgs<T>,
) => ModuleFireRenderResponse;
export type ModuleFireRenderResponse = JSX.Element | null | undefined;
export type ModuleFireRenderArgs<T extends P> = {
  module: string | t.IModule<any>;
  selected?: string;
  data?: T['data'];
  view?: T['view'];
  notFound?: T['view'];
};

export type ModuleFireSelection = (args: ModuleFireSelectionArgs) => void;
export type ModuleFireSelectionArgs = {
  root: t.ITreeNode | t.IModule;
  selected?: string;
};

export type ModuleRequestResponse<T extends P = AnyProps> = {
  module?: t.IModule<T>;
};

/**
 * Event helpers
 */
export type IModuleEvents<T extends P> = {
  $: Observable<ModuleEvent>;
  register$: Observable<IModuleRegister>;
  registered$: Observable<IModuleRegistered>;
  childRegistered$: Observable<IModuleChildRegistered>;
  childDisposed$: Observable<IModuleChildDisposed>;
  changed$: Observable<IModuleChanged>;
  patched$: Observable<IModulePatched>;
  selection$: Observable<IModuleSelection<T>>;
  render$: Observable<IModuleRender<T>>;
  rendered$: Observable<IModuleRendered>;
  render(view?: T['view']): Observable<IModuleRender<T>>;
  filter(fn: ModuleFilterEvent): IModuleEvents<T>;
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

export type IModuleSelectionEvent<T extends P = AnyProps> = {
  type: 'Module/selection';
  payload: IModuleSelection<T>;
};
export type IModuleSelection<T extends P> = {
  module: string;
  selection?: IModuleSelectionTree;
  data: NonNullable<T['data']>;
  view: NonNullable<T['view']>;
};

export type IModuleRenderEvent<T extends P = AnyProps> = {
  type: 'Module/render';
  payload: IModuleRender<T>;
};
export type IModuleRender<T extends P> = {
  module: string;
  selected?: string;
  data: T['data'];
  view: NonNullable<T['view']>;
  handled: boolean;
  render(el: JSX.Element | null): void;
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
