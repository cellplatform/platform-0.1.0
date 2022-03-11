import React from 'react';
import { Observable } from 'rxjs';

import { EventList, EventListProps } from '..';
import { t, rx } from '../common';
import { useEventBusHistory } from '../../Event';

export type DevSampleProps = {
  bus: t.EventBus<any>;
  childProps: EventListProps;
  reset$: Observable<void>;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { bus, childProps, reset$ } = props;
  const history = useEventBusHistory(bus, { insertAt: 'Start', reset$ });
  return <EventList {...childProps} items={history.events} style={{ flex: 1 }} />;
};
