import { Disposable, EventBus } from '@platform/types';
import { Observable } from 'rxjs';
import * as t from '../../common/types';

type Id = string;
type Index = number;

export type EventListAlign = 'auto' | 'smart' | 'center' | 'end' | 'start';

/**
 * Component Properties
 */
export type EventListBusArgs = { bus: t.EventBus<any>; instance: string };
export type EventListProps = {
  bus: t.EventBus<any>;
  event?: EventListBusArgs; // Optional, internally bus/instance used by the UI.
  reset$?: Observable<any>;
  debug?: EventListDebugProps;
  style?: t.CssValue;
};
export type EventListDebugProps = {
  busid?: boolean;
  tracelines?: boolean;
};

/**
 * EVENTS (API)
 */
export type EventListEventsFactory = (args: {
  bus: EventBus<any>;
  instance: Id;
}) => EventListEvents;

export type EventListEvents = Disposable & {
  bus: Id;
  instance: Id;
  $: Observable<EventListEvent>;
  scroll: {
    $: Observable<EventListScroll>;
    fire(target: EventListScroll['target'], options?: { align?: EventListAlign }): void;
  };
  click: {
    $: Observable<EventListClicked>;
    fire(args: { index: Index; item: t.EventHistoryItem }): void;
  };
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
