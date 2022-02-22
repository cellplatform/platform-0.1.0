import React from 'react';

import { EventList, EventListProps } from '..';
import { t } from '../../common';
import { useEventBusHistory } from '../../Event';

export type DevSampleProps = {
  netbus: t.NetworkBusMock<any>;
  childProps: EventListProps;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const history = useEventBusHistory(props.netbus, {});
  return <EventList {...props.childProps} items={history.events} style={{ flex: 1 }} />;
};
