import * as React from 'react';
import { Observable, MonoTypeOperatorFunction } from 'rxjs';

import * as t from './common/types';

type E = t.ModuleEvent;
type N = t.ITreeNode;
type S = string;
type O = Record<string, unknown>;
type B = t.EventBus<any>;
type P = t.IModuleProps;
type AnyProps = t.IModulePropsAny;

/**
 * The definition entry-point for a module.
 * This is what is explored by module authors.
 */
export type IModuleDef = {
  init(bus: t.EventBus, parent?: string): t.IModule;
};

export type ModuleArgs<T extends P> = t.ITreeStateArgs<IModuleNode<T>> & {
  bus: B; // Global event-bus.
  view?: T['view']; // TODO 🐷 - move to [ViewModule]
  data?: T['data'];
};

/**
 * Static module methods.
 */
export type Module = {
  create<T extends P>(args?: ModuleArgs<T>): IModule<T>;
  register(bus: B, module: t.IModule, parent?: string): t.ModuleRegistration;

  Identity: t.TreeIdentity;
  Query: t.TreeQuery;

  fire<T extends P>(bus: B): IModuleFire<T>;

  events<T extends P>(
    subject: Observable<t.Event> | t.IModule,
    until$?: Observable<any>,
  ): IModuleEvents<T>;

  isModuleEvent(event: t.Event): boolean;

  filter<T extends E = E>(
    event$: Observable<t.Event>,
    filter?: t.ModuleFilterEvent<T>,
  ): Observable<T>;
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
  view?: V;
  data?: D;
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

export type ModuleFilterEvent<T extends E = E> = (args: ModuleFilterEventArgs<T>) => boolean;
export type ModuleFilterEventArgs<T extends E = E> = ModuleFilterArgs & {
  event: T;
};

export type ModuleFilterView = (args: ModuleFilterViewArgs) => boolean;
export type ModuleFilterViewArgs = ModuleFilterArgs & { view: string };

/**
 * Event Bus (fire).
 */
export type IModuleFire<T extends P> = {
  register(module: t.IModule<any>, parent?: string): t.ModuleRegistration;
  request<T extends P>(id: string): t.ModuleRequestResponse<T>;
};

export type ModuleRequestResponse<T extends P = AnyProps> = { module?: t.IModule<T> };

/**
 * Event helpers
 */
export type IModuleEvents<T extends P> = {
  $: Observable<ModuleEvent>;
  register$: Observable<IModuleRegister>;
  registered$: Observable<IModuleRegistered>;
  childRegistered$: Observable<IModuleChildRegistered>;
  childDisposed$: Observable<IModuleChildDisposed>;
  changed$: Observable<IModuleChanged<T>>;
  patched$: Observable<IModulePatched>;
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

export type IModuleChangedEvent<T extends P = P> = {
  type: 'Module/changed';
  payload: IModuleChanged<T>;
};
export type IModuleChanged<T extends P = P> = {
  module: string;
  change: t.ITreeStateChanged<t.IModuleNode<T>>;
};

export type IModulePatchedEvent = {
  type: 'Module/patched';
  payload: IModulePatched;
};
export type IModulePatched = {
  module: string;
  patch: t.ITreeStatePatched;
};

export type IModuleRequestEvent = {
  type: 'Module/request';
  payload: IModuleRequest;
};
export type IModuleRequest = {
  module: string;
  handled: boolean;
  respond<T extends P = AnyProps>(args: { module: t.IModule<T> }): void;
};

/**
 * UI ("user interface").
 */

/**
 * Fires a request for a module to be rendered in UI.
 */
export type IModuleRenderEvent<T extends P = AnyProps> = {
  type: 'Module/ui/render';
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

/**
 * The response to a module render event containing the UI to render.
 */
export type IModuleRenderedEvent = {
  type: 'Module/ui/rendered';
  payload: IModuleRendered;
};
export type IModuleRendered = { module: string; view: string; el: JSX.Element | null };

/**
 * Fires when the of the module selection within a user-interface changes.
 */
export type IModuleSelectionEvent<T extends P = AnyProps> = {
  type: 'Module/ui/selection';
  payload: IModuleSelection<T>;
};
export type IModuleSelection<T extends P> = {
  module: string;
  selection?: IModuleSelectionTree;
  data: NonNullable<T['data']>;
  view: NonNullable<T['view']>;
};
