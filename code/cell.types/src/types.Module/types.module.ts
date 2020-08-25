export type TEMP_MODULE = 123;

// import { Observable } from 'rxjs';

// import { t } from '../common';

// type E = t.ModuleEvent;
// type N = t.ITreeNode;
// type O = Record<string, unknown>;
// type B = t.EventBus<any>;
// type P = t.IModuleProps;
// type AnyProps = t.IModulePropsAny;

// /**
//  * The definition entry-point for a module.
//  * This is what is explored by module authors.
//  */
// export type IModuleDef = {
//   init(bus: t.EventBus, parent?: string): t.IModule;
// };

// export type ModuleArgs<T extends P> = {
//   bus: B; // Global event-bus.
//   root?: t.IModuleNode<T> | string;
//   data?: T['data'];
//   dispose$?: Observable<any>;
// };

// /**
//  * Static module methods.
//  */
// export type Module = {
//   create<T extends P>(args?: ModuleArgs<T>): IModule<T>;
//   register(bus: B, module: t.IModule, parent?: string): t.ModuleRegistration;

//   Identity: t.TreeIdentity;
//   Query: t.TreeQuery;

//   fire<T extends P>(bus: B): IModuleFire<T>;

//   events<T extends P>(
//     subject: Observable<t.Event> | t.IModule,
//     until$?: Observable<any>,
//   ): IModuleEvents<T>;

//   isModuleEvent(event: t.Event): boolean;

//   filter<T extends E = E>(
//     event$: Observable<t.Event>,
//     filter?: t.ModuleFilterEvent<T>,
//   ): Observable<T>;
// };

// /**
//  * Registration.
//  */
// export type ModuleRegistration = {
//   ok: boolean;
//   module: t.IModule;
//   parent?: t.IModule;
// };

// /**
//  * A module state-tree.
//  */
// export type IModule<T extends P = AnyProps> = t.ITreeState<IModuleNode<T>, t.ModuleEvent>;

// /**
//  * A tree-node that contains details about a module.
//  */
// export type IModuleNode<T extends P> = t.ITreeNode<T>;

// /**
//  * The way a module is expressed as props within a tree-node.
//  */
// export type IModuleProps<D extends O = O> = {
//   kind?: 'MODULE';
//   data?: D;
// };
// export type IModulePropsAny = t.IModuleProps<any>;

// /**
//  * Filter.
//  */

// export type ModuleFilterArgs = {
//   module: string;
//   namespace: string;
//   key: string;
// };

// export type ModuleFilterEvent<T extends E = E> = (args: ModuleFilterEventArgs<T>) => boolean;
// export type ModuleFilterEventArgs<T extends E = E> = ModuleFilterArgs & {
//   event: T;
// };

// /**
//  * Event Bus (fire).
//  */
// export type IModuleFire<T extends P> = {
//   register(module: t.IModule<any>, parent?: string): t.ModuleRegistration;
//   request<T extends P>(id: string): t.ModuleRequestResponse<T>;
// };

// export type ModuleRequestResponse<T extends P = AnyProps> = { module?: t.IModule<T> };

// /**
//  * Event helpers
//  */
// export type IModuleEvents<T extends P> = {
//   $: Observable<ModuleEvent>;
//   register$: Observable<IModuleRegister>;
//   registered$: Observable<IModuleRegistered>;
//   childRegistered$: Observable<IModuleChildRegistered>;
//   childDisposed$: Observable<IModuleChildDisposed>;
//   changed$: Observable<IModuleChanged<T>>;
//   patched$: Observable<IModulePatched>;
// };

// /**
//  * [Events]
//  */

// export type ModuleEvent =
//   | IModuleRegisterEvent
//   | IModuleRegisteredEvent
//   | IModuleChildRegisteredEvent
//   | IModuleChildDisposedEvent
//   | IModuleChangedEvent
//   | IModulePatchedEvent
//   | IModuleRequestEvent;

// export type IModuleRegisterEvent = {
//   type: 'Module/register';
//   payload: IModuleRegister;
// };
// export type IModuleRegister = { module: string; parent?: string };

// export type IModuleRegisteredEvent = {
//   type: 'Module/registered';
//   payload: IModuleRegistered;
// };
// export type IModuleRegistered = { module: string; parent: string };

// export type IModuleChildRegisteredEvent = {
//   type: 'Module/child/registered';
//   payload: IModuleChildRegistered;
// };
// export type IModuleChildRegistered = { module: string; child: string };

// export type IModuleChildDisposedEvent = {
//   type: 'Module/child/disposed';
//   payload: IModuleChildDisposed;
// };
// export type IModuleChildDisposed = { module: string; child: string };

// export type IModuleChangedEvent<T extends P = P> = {
//   type: 'Module/changed';
//   payload: IModuleChanged<T>;
// };
// export type IModuleChanged<T extends P = P> = {
//   module: string;
//   change: t.ITreeStateChanged<t.IModuleNode<T>>;
// };

// export type IModulePatchedEvent = {
//   type: 'Module/patched';
//   payload: IModulePatched;
// };
// export type IModulePatched = {
//   module: string;
//   patch: t.ITreeStatePatched;
// };

// export type IModuleRequestEvent = {
//   type: 'Module/request';
//   payload: IModuleRequest;
// };
// export type IModuleRequest = {
//   module: string;
//   handled: boolean;
//   respond<T extends P = AnyProps>(args: { module: t.IModule<T> }): void;
// };
