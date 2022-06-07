import { CssValue } from '@platform/css';
import { Disposable, EventBus } from '@platform/types';
import { Observable } from 'rxjs';

import * as t from '../../types';

type Id = string;
type Index = number;
type Pixels = number;

export type ListInstance = { bus: EventBus<any>; id: Id };
export type ListItemAlign = 'auto' | 'smart' | 'center' | 'end' | 'start';

export type ListOrientation = 'x' | 'y'; // x:horizontal, y:vertical
export type ListBulletEdge = 'near' | 'far';
export type ListBulletSpacing = { before?: Pixels; after?: Pixels };

export type ListCursor = {
  total: number;
  getData: t.GetListItem;
  getSize: t.GetListItemSize;
};

/**
 * <List> properties.
 */
export type ListProps = {
  instance?: t.ListInstance;
  renderers?: { bullet?: t.ListItemRenderer; body?: t.ListItemRenderer };
  state?: t.ListStateLazy;
  orientation?: t.ListOrientation;
  bullet?: { edge?: t.ListBulletEdge; size?: Pixels };
  spacing?: number | t.ListBulletSpacing; // Number (defaults to) => { before }
  tabIndex?: number;
  style?: CssValue;
  debug?: ListPropsDebug;
};
export type ListPropsDebug = { tracelines?: boolean };

/**
 * Items
 */
export type ListItem<T = any> = {
  data: T;
  spacing?: ListBulletSpacing;
};

/**
 * Rendering
 */
export type ListItemRenderer = (e: ListItemRendererArgs) => JSX.Element | null | undefined; // <null> == nothing, <undefined> == use default
export type ListItemRendererArgs<T = any> = {
  kind: 'Default' | 'Spacing';
  index: number;
  total: number;
  data: T;
  orientation: ListOrientation;
  bullet: { edge: ListBulletEdge; size: Pixels };
  spacing: ListBulletSpacing;
  is: ListItemRenderFlags;
};
export type ListItemRenderFlags = {
  empty: boolean;
  single: boolean;
  first: boolean;
  last: boolean;
  edge: boolean;
  vertical: boolean;
  horizontal: boolean;
  spacer: boolean;
  bullet: { near: boolean; far: boolean };
  selected: boolean;
  focused: boolean;
  scrolling: boolean;
  mouse: { over: boolean; down: boolean };
  previous(): ListItemRenderFlags | undefined;
  next(): ListItemRenderFlags | undefined;
};

export type GetListItemSize = (args: GetListItemSizeArgs) => Pixels;
export type GetListItemSizeArgs = {
  index: number;
  total: number;
  item: ListItem;
  is: { first: boolean; last: boolean; vertical: boolean; horizontal: boolean };
};

export type GetListItem = (index: number) => ListItem | undefined;

/**
 * EVENTS (API)
 */
export type ListEventsFactory = (args: {
  instance: ListInstance;
  dispose$?: Observable<any>;
}) => ListEvents;
export type ListEvents = Disposable & {
  bus: Id;
  instance: Id;
  $: Observable<ListEvent>;
  scroll: {
    $: Observable<ListScroll>;
    fire(target: ListScroll['target'], options?: { align?: ListItemAlign }): void;
  };
  redraw: {
    $: Observable<ListRedraw>;
    fire(): void;
  };
  focus: {
    $: Observable<ListFocus>;
    fire(isFocused?: boolean): void;
  };
  state: {
    changed$: Observable<ListStateChanged>;
  };
  item(index: Index): ListItemEvents;
};

export type ListItemEvents = {
  changed: { $: Observable<ListItemChanged> };
};

/**
 * EVENT Definitions
 */
export type ListEvent =
  | ListScrollEvent
  | ListRedrawEvent
  | ListFocusEvent
  | ListItemChangedEvent
  | ListStateChangedEvent;

/**
 * Initiates a scroll operation on the list.
 */
export type ListScrollEvent = {
  type: 'sys.ui.List/Scroll';
  payload: ListScroll;
};
export type ListScroll = {
  instance: Id;
  target: 'Top' | 'Bottom' | Index;
  align?: ListItemAlign;
};

/**
 * Forces a redraw of the list.
 */
export type ListRedrawEvent = {
  type: 'sys.ui.List/Redraw';
  payload: ListRedraw;
};
export type ListRedraw = { instance: Id };

/**
 * Causes the list to recieve focus.
 */
export type ListFocusEvent = {
  type: 'sys.ui.List/Focus';
  payload: ListFocus;
};
export type ListFocus = { instance: Id; focus: boolean };

/**
 * Fires when a single list item's state has changed.
 */
export type ListItemChangedEvent = {
  type: 'sys.ui.List/Item/Changed';
  payload: ListItemChanged;
};
export type ListItemChanged = {
  instance: Id;
  index: Index;
  state: { list: t.ListState };
};

export type ListStateChangedEvent = {
  type: 'sys.ui.List/State:changed';
  payload: ListStateChanged;
};
export type ListStateChanged = {
  instance: Id;
  kind: t.ListStateChange['kind'];
  from: t.ListState;
  to: t.ListState;
};
