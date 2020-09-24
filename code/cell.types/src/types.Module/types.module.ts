import { t } from '../common';

type E = t.ModuleEvent;
type O = Record<string, unknown>;
type B = t.EventBus<any>;
type P = t.IModuleProps;
type AnyProps = t.IModulePropsAny;

export type ModuleArgs<T extends P> = {
  bus: B; // Global event-bus.
  root?: t.IModuleNode<T> | string;
  data?: T['data'];
  dispose$?: t.Observable<any>;
};

/**
 * Static module methods for working in standard ways against
 * an [IModule] data instance.
 */
export type Module = {
  kind: 'ModuleMethods';

  create<T extends P>(args?: ModuleArgs<T>): IModule<T>;
  register(bus: B, module: t.IModule, parent?: t.NodeIdentifier): t.ModuleRegistration;

  Identity: t.TreeIdentity;
  Query: t.TreeQuery;

  fire<T extends P>(bus: B): IModuleFire<T>;

  events<T extends P>(subject: t.Observable<t.Event>, until$?: t.Observable<any>): IModuleEvents<T>;

  filter<T extends E = E>(
    event$: t.Observable<t.Event>,
    filter?: t.ModuleFilterEvent<T>,
  ): t.Observable<T>;

  is: {
    moduleEvent(event: t.Event): boolean;
  };
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

/**
 * The way a module is expressed as props within a tree-node.
 */
export type IModuleProps<D extends O = O> = {
  kind?: 'Module';
  data?: D;
};
export type IModulePropsAny = t.IModuleProps<any>;

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

/**
 * Event Bus (fire).
 */
export type IModuleFire<T extends P> = {
  register(module: t.IModule<any>, parent?: t.NodeIdentifier): t.ModuleRegistration;
  request<T extends P>(id: string | t.NodeIdentifier): t.IModule<T> | undefined;
  find<T extends P>(args?: t.IModuleFindArgs): t.IModule<T>[];
};

/**
 * Event helpers
 */
export type IModuleEvents<T extends P> = {
  $: t.Observable<ModuleEvent>;
  register$: t.Observable<IModuleRegister>;
  registered$: t.Observable<IModuleRegistered>;
  childRegistered$: t.Observable<IModuleChildRegistered>;
  childDisposed$: t.Observable<IModuleChildDisposed>;
  changed$: t.Observable<IModuleChanged<T>>;
  patched$: t.Observable<IModulePatched>;
};

/**
 * [Events]
 */

export type ModuleEvent =
  | IModuleRegisterEvent
  | IModuleRegisteredEvent
  | IModuleChildRegisteredEvent
  | IModuleChildDisposedEvent
  | IModuleChangedEvent
  | IModulePatchedEvent
  | IModuleRequestEvent
  | IModuleFindEvent;

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
  respond<T extends P>(module: t.IModule<T>): void;
};

export type IModuleFindEvent = {
  type: 'Module/find';
  payload: IModuleFind;
};
export type IModuleFind = IModuleFindArgs & {
  module: string | '*'; // Wildcard ("*" or empty) includes all modules, otherwise matches will be filtered as children of the given module-id.
  respond<T extends P>(module: t.IModule<T>): void;
};
export type IModuleFindArgs = {
  module?: string | '*'; // Wildcard ("*" or empty) includes all modules, otherwise matches will be filtered as children of the given module-id.
  key?: string;
  namespace?: string;
  data?: Record<string, string | number | boolean>;
};
