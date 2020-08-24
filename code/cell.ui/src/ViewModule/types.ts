import { Observable } from 'rxjs';

import * as t from '../common/types';

type B = t.EventBus<any>;
type S = string;
type O = Record<string, unknown>;
type P = t.IViewModuleProps;
type E = t.ViewModuleEvent;

export type ViewModuleArgs<T extends P> = t.ModuleArgs<T> & {
  treeview?: T['treeview'];
};

/**
 * Static UI module methods.
 */
export type ViewModule = {
  Context: React.Context<any>;
  provider<T extends O>(context: T): React.FunctionComponent;

  register: t.Module['register'];
  Identity: t.Module['Identity'];
  Query: t.Module['Query'];
  isModuleEvent: t.Module['isModuleEvent'];
  filter: t.Module['filter'];

  create<T extends P>(args?: ViewModuleArgs<T>): t.IModule<T>;

  fire<T extends P>(bus: B): t.IViewModuleFire<T>;

  events<T extends P>(
    subject: Observable<t.Event> | t.IModule,
    until$?: Observable<any>,
  ): t.IViewModuleEvents<T>;
};

/**
 * The way a UI module is expressed as props within a tree-node.
 */
export type IViewModuleProps<D extends O = O, V extends S = S> = t.IModuleProps<D, V> & {
  treeview?: t.ITreeviewNodeProps;
};

/**
 * Event Bus (fire).
 */
export type IViewModuleFire<T extends P> = t.IModuleFire<T> & {
  render: ModuleFireRender<T>;
  selection: ModuleFireSelection;
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
export type ModuleFireSelectionArgs = { root: t.ITreeNode | t.IModule; selected?: string };

/**
 * Event helpers
 */
export type IViewModuleEvents<T extends P> = t.IModuleEvents<T> & {
  selection$: Observable<t.IModuleSelection<T>>;
  render$: Observable<t.IModuleRender<T>>;
  rendered$: Observable<t.IModuleRendered>;
  render(view?: T['view']): Observable<t.IModuleRender<T>>;
};

/**
 * [EVENTS]
 */

export type ViewModuleEvent = t.ModuleEvent;
