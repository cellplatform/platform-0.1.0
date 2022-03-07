import { Disposable, EventBus } from '@platform/types';
import { Observable } from 'rxjs';

type InstanceId = string;
type Index = number;
type Pixels = number;

export type ListItemAlign = 'auto' | 'smart' | 'center' | 'end' | 'start';

export type ListOrientation = 'x' | 'y'; // x:horizontal, y:vertical
export type ListBulletEdge = 'near' | 'far';
export type ListBulletSpacing = { before?: Pixels; after?: Pixels };

export type ListItem<T = any> = {
  data: T;
  spacing?: ListBulletSpacing;
};

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
export type ListEventsFactory = (args: { bus: EventBus<any>; instance: InstanceId }) => ListEvents;

export type ListEvents = Disposable & {
  $: Observable<ListEvent>;
  instance: InstanceId;
  scroll: {
    $: Observable<ListScroll>;
    fire(target: ListScroll['target'], options?: { align?: ListItemAlign }): void;
  };
  click: {
    $: Observable<ListClick>;
    fire(args: {
      index: Index;
      item: ListItem;
      mouse: ListClick['mouse'];
      button: ListClick['button'];
    }): void;
  };
  redraw: {
    $: Observable<ListRedraw>;
    fire(): void;
  };
};

/**
 * EVENT Definitions
 */
export type ListEvent = ListScrollEvent | ListClickEvent | ListRedrawEvent;

/**
 * Initiates a scroll operation on the list.
 */
export type ListScrollEvent = {
  type: 'sys.ui.List/Scroll';
  payload: ListScroll;
};
export type ListScroll = {
  instance: InstanceId;
  target: 'Top' | 'Bottom' | Index;
  align?: ListItemAlign;
};

/**
 * Fires when an event is clicked.
 */
export type ListClickEvent = {
  type: 'sys.ui.List/Click';
  payload: ListClick;
};
export type ListClick = {
  instance: InstanceId;
  index: Index;
  item: ListItem;
  mouse: 'Down' | 'Up';
  button: 'Left' | 'Right';
};

/**
 * Forces a redraw of the list.
 */
export type ListRedrawEvent = {
  type: 'sys.ui.List/Redraw';
  payload: ListRedraw;
};
export type ListRedraw = { instance: InstanceId };
