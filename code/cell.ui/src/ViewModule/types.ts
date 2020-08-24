import { Observable } from 'rxjs';

import * as t from '../common/types';

type B = t.EventBus<any>;
type S = string;
type O = Record<string, unknown>;
type P = t.IViewModuleProps;
type E = t.ViewModuleEvent;
type AnyProps = t.IModulePropsAny;

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

export type ViewModuleEvent =
  | t.ModuleEvent
  | IModuleSelectionEvent
  | IModuleRenderEvent
  | IModuleRenderedEvent;

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
export type IModuleSelectionTree = { id: string; props: t.ITreeviewNodeProps };
