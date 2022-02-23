import { Observable, Subject, BehaviorSubject, firstValueFrom, timeout, of, interval } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
  tap,
  catchError,
} from 'rxjs/operators';

import React from 'react';

import { EventList, EventListProps } from '..';
import { t } from '../../common';
import { useEventBusHistory } from '../../Event';

export type DevSampleProps = {
  netbus: t.NetworkBusMock<any>;
  childProps: EventListProps;

  reset$: Observable<void>;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { netbus, reset$ } = props;

  const history = useEventBusHistory(netbus, { insertAt: 'Start', reset$ });
  return <EventList {...props.childProps} items={history.events} style={{ flex: 1 }} />;
};
