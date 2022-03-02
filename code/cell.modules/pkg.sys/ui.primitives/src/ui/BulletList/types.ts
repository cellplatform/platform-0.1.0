import { Disposable, EventBus } from '@platform/types';
import { Observable } from 'rxjs';

type InstanceId = string;
type Index = number;
type Pixels = number;

export type BulletListItemAlign = 'auto' | 'smart' | 'center' | 'end' | 'start';

export type BulletOrientation = 'x' | 'y'; // x:horizontal, y:vertical
export type BulletEdge = 'near' | 'far';
export type BulletSpacing = { before?: Pixels; after?: Pixels };

export type BulletItem<T = any> = {
  data: T;
  spacing?: BulletSpacing;
};

export type BulletRenderer = (e: BulletRendererArgs) => JSX.Element | null | undefined; // <null> == nothing, <undefined> == use default
export type BulletRendererArgs<T = any> = {
  kind: 'Default' | 'Spacing';
  index: number;
  total: number;
  data: T;
  orientation: BulletOrientation;
  bullet: { edge: BulletEdge; size: Pixels };
  spacing: BulletSpacing;
  is: BulletRenderFlags;
};
export type BulletRenderFlags = {
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

export type GetBulletItemSize = (args: GetBulletItemSizeArgs) => Pixels;
export type GetBulletItemSizeArgs = {
  index: number;
  total: number;
  item: BulletItem;
  is: { first: boolean; last: boolean; vertical: boolean; horizontal: boolean };
};

export type GetBulletItem = (index: number) => BulletItem | undefined;

/**
 * EVENTS (API)
 */
export type BulletListEventsFactory = (args: {
  bus: EventBus<any>;
  instance: InstanceId;
}) => BulletListEvents;

export type BulletListEvents = Disposable & {
  $: Observable<BulletListEvent>;
  instance: InstanceId;
  scroll: {
    $: Observable<BulletListScroll>;
    fire(target: BulletListScroll['target'], options?: { align?: BulletListItemAlign }): void;
  };
  click: {
    $: Observable<BulletListClick>;
    fire(args: {
      index: Index;
      item: BulletItem;
      mouse: BulletListClick['mouse'];
      button: BulletListClick['button'];
    }): void;
  };
  redraw: {
    $: Observable<BulletListRedraw>;
    fire(): void;
  };
};

/**
 * EVENT Definitions
 */
export type BulletListEvent = BulletListScrollEvent | BulletListClickEvent | BulletListRedrawEvent;

/**
 * Initiates a scroll operation on the list.
 */
export type BulletListScrollEvent = {
  type: 'sys.ui.BulletList/Scroll';
  payload: BulletListScroll;
};
export type BulletListScroll = {
  instance: InstanceId;
  target: 'Top' | 'Bottom' | Index;
  align?: BulletListItemAlign;
};

/**
 * Fires when an event is clicked.
 */
export type BulletListClickEvent = {
  type: 'sys.ui.BulletList/Click';
  payload: BulletListClick;
};
export type BulletListClick = {
  instance: InstanceId;
  index: Index;
  item: BulletItem;
  mouse: 'Down' | 'Up';
  button: 'Left' | 'Right';
};

/**
 * Forces a redraw of the list.
 */
export type BulletListRedrawEvent = {
  type: 'sys.ui.BulletList/Redraw';
  payload: BulletListRedraw;
};
export type BulletListRedraw = { instance: InstanceId };
