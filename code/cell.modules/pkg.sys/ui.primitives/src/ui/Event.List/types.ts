import { Disposable, EventBus } from '@platform/types';
import { Observable } from 'rxjs';

type InstanceId = string;
type Color = string | number;
type Index = number;

export type EventListAlign = 'auto' | 'smart' | 'center' | 'end' | 'start';

export type EventListColors = {
  margin: Color;
  typeLabel: Color;
};

/**
 * Event API.
 */
export type EventListEventsFactory = (args: {
  bus: EventBus<any>;
  instance: InstanceId;
}) => EventListEvents;

export type EventListEvents = Disposable & {
  $: Observable<EventListEvent>;
  instance: InstanceId;
  scroll: {
    $: Observable<EventListScroll>;
    fire(target: EventListScroll['target'], options?: { align?: EventListAlign }): void;
  };
};

/**
 * Events Definitions
 */
export type EventListEvent = EventListScrollEvent;

export type EventListScrollEvent = {
  type: 'sys.ui.EventList/Scroll';
  payload: EventListScroll;
};
export type EventListScroll = {
  instance: InstanceId;
  target: 'Top' | 'Bottom' | Index;
  align?: EventListAlign;
};
