import React from 'react';
import { Observable } from 'rxjs';

import { EventList, EventListProps } from '..';
import { t } from '../../common';
import { useEventBusHistory } from '../../Event';

export type DevSampleProps = {
  bus: t.EventBus<any>;
  childProps: EventListProps;

  reset$: Observable<void>;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { bus: netbus, reset$ } = props;
  const history = useEventBusHistory(netbus, { insertAt: 'Start', reset$ });
  return <EventList {...props.childProps} items={history.events} style={{ flex: 1 }} />;
};
