import React, { useEffect, useRef } from 'react';

import { useEventHistory } from '../Event';
import { CONSTANTS, css, FC, t } from './common';
import { DebugBusId } from './ui/Debug.BusId';
import { Empty } from './ui/Empty';
import { EventListLayout as Layout, EventListLayoutProps } from './ui/Layout';
import { EventListEvents as Events } from './Events';
import { EventListProps } from './types';
import { Util } from './Util';

/**
 * Types
 */
export { EventListProps };

/**
 * Component
 */
const View: React.FC<EventListProps> = (props) => {
  const { bus, reset$, debug = {} } = props;
  const instance = useRef<t.EventListInstance>(props.instance ?? Util.dummyInstance());

  const history = useEventHistory(bus, { reset$ });
  const items = history.events;
  const isEmpty = items.length === 0;

  // NB: Reset this history log when/if the bus instance changes.
  useEffect(() => history.reset(), [bus]); // eslint-disable-line

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', display: 'flex' }),
  };

  const elLayout = !isEmpty && (
    <Layout event={instance.current} items={items} debug={debug} style={{ flex: 1 }} />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {isEmpty && <Empty />}
      {elLayout}
      {Boolean(debug.busid) && <DebugBusId bus={bus} debug={debug} />}
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
