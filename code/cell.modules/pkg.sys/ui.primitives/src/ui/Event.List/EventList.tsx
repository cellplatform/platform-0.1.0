import React, { useRef } from 'react';
import { Observable } from 'rxjs';

import { useEventHistory } from '../Event';
import { css, CssValue, FC, rx, slug, t, CONSTANTS } from './common';
import { EventListLayout as Layout, EventListLayoutProps } from './components/Layout';
import { EventListEvents as Events } from './Events';

type Internal = { bus: t.EventBus<any>; instance: string };

/**
 * Types
 */
export type EventListProps = {
  bus: t.EventBus<any>;
  event?: Internal; // Optional, internally bus/instance used by the UI.
  reset$?: Observable<any>;
  style?: CssValue;
};

/**
 * Component
 */
export const View: React.FC<EventListProps> = (props) => {
  const { reset$ } = props;
  const internal = useRef<Internal>(props.event ?? dummy());
  const history = useEventHistory(props.bus, { reset$ });

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', display: 'flex' }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <Layout event={internal.current} items={history.events} style={{ flex: 1 }} />
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  Events: t.EventListEventsFactory;
  Layout: React.FC<EventListLayoutProps>;
  useEventHistory: t.UseEventHistory;
  constants: typeof CONSTANTS;
};
export const EventList = FC.decorate<EventListProps, Fields>(
  View,
  { Events, Layout, useEventHistory, constants: CONSTANTS },
  { displayName: 'EventList' },
);

/**
 * [Helpers]
 */

function dummy(): Internal {
  return {
    bus: rx.bus(),
    instance: `EventList.${slug()}:internal`,
  };
}
