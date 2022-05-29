import { Disposable, EventBus } from '@platform/types';
import { Observable } from 'rxjs';
import * as t from '../../common/types';

type Id = string;
type Index = number;

export type EventListAlign = 'auto' | 'smart' | 'center' | 'end' | 'start';

/**
 * Component Properties
 */
export type EventListInstance = { bus: t.EventBus<any>; id: Id };
export type EventListProps = {
  bus: t.EventBus<any>;
  instance?: EventListInstance; // Optional, internally bus/instance used by the UI.
  reset$?: Observable<any>;
  debug?: EventListDebugProps;
  style?: t.CssValue;
};
export type EventListDebugProps = {
  busid?: boolean | EventListDebugEdge;
  tracelines?: boolean;
};
export type EventListDebugEdge = 'TopLeft' | 'TopRight' | 'BottomLeft' | 'BottomRight';

/**
 * EVENTS (API)
 */
export type EventListEventsFactory = (args: { instance: EventListInstance }) => EventListEvents;

export type EventListEvents = Disposable & {
  instance: { bus: Id; id: Id };
  $: Observable<EventListEvent>;
  click: {
    $: Observable<EventListClicked>;
    fire(args: { index: Index; item: t.EventHistoryItem }): void;
  };
  redraw(): void;
  scroll(target: t.ListScroll['target'], options?: { align?: t.ListItemAlign }): void;
};

/**
 * Events Definitions
 */
export type EventListEvent = EventListScrollEvent | EventListClickedEvent;

/**
 * Initiates a scroll operation on the list.
 */
export type EventListScrollEvent = {
  type: 'sys.ui.EventList/Scroll';
  payload: EventListScroll;
};
export type EventListScroll = {
  instance: Id;
  target: 'Top' | 'Bottom' | Index;
  align?: EventListAlign;
};

/**
 * Fires when an event is clicked.
 */
export type EventListClickedEvent = {
  type: 'sys.ui.EventList/Clicked';
  payload: EventListClicked;
};
export type EventListClicked = {
  instance: Id;
  index: Index;
  item: t.EventHistoryItem;
};
