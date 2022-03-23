import { CssValue } from '@platform/css';
import { Disposable, EventBus } from '@platform/types';
import { Observable } from 'rxjs';

import * as t from '../../types';

type Id = string;
type Index = number;
type Pixels = number;

export type ListBusArgs = { bus: EventBus<any>; instance: Id };
export type ListItemAlign = 'auto' | 'smart' | 'center' | 'end' | 'start';

export type ListOrientation = 'x' | 'y'; // x:horizontal, y:vertical
export type ListBulletEdge = 'near' | 'far';
export type ListBulletSpacing = { before?: Pixels; after?: Pixels };

/**
 * <List> properties.
 */
export type ListProps = {
  event?: t.ListBusArgs;
  renderers?: { bullet?: t.ListBulletRenderer; body?: t.ListBulletRenderer };
  state?: t.ListStateLazy;
  orientation?: t.ListOrientation;
  bullet?: { edge?: t.ListBulletEdge; size?: Pixels };
  spacing?: number | t.ListBulletSpacing; // Number (defaults to) => { before }
  tabIndex?: number;
  style?: CssValue;
  debug?: { border?: boolean };
};

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
export type ListBulletRenderer = (e: ListBulletRendererArgs) => JSX.Element | null | undefined; // <null> == nothing, <undefined> == use default
export type ListBulletRendererArgs<T = any> = {
  kind: 'Default' | 'Spacing';
  index: number;
  total: number;
  data: T;
  orientation: ListOrientation;
  bullet: { edge: ListBulletEdge; size: Pixels };
  spacing: ListBulletSpacing;
  is: ListBulletRenderFlags;
};
export type ListBulletRenderFlags = {
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
export type ListEventsFactory = (args: { bus: EventBus<any>; instance: Id }) => ListEvents;
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
  item(index: Index): ListItemEvents;
};

export type ListItemEvents = {
  changed: {
    $: Observable<ListItemChanged>;
  };
};

/**
 * EVENT Definitions
 */
export type ListEvent = ListScrollEvent | ListRedrawEvent | ListItemChangedEvent;

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
