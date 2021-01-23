import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, t } from '../../common';
import { Host, HostProps } from './Host';

export type ActionHostProps = HostProps & {
  bus: t.EventBus;
  actions: t.DevActionModelBuilder<any>;
};

/**
 * A wrapper around <Host> that handles triggoring redraws when
 * the [Actions] context data changes.
 */
export const ActionsHost: React.FC<ActionHostProps> = (props) => {
  const { bus, actions } = props;
  const [count, setCount] = useState<number>(0); // NB: Hack for causing redraws.

  useEffect(() => {
    const dispose$ = new Subject<void>();

    rx.payload<t.IDevActionCtxChangedEvent>(bus.event$, 'Dev/Action/ctx:changed')
      .pipe(
        takeUntil(dispose$),
        filter((e) => e.actions === actions.toObject().id),
      )
      .subscribe((e) => setCount((prev) => prev + 1));

    return () => dispose$.next();
  }, [bus, actions]); // eslint-disable-line

  return <Host {...props} subject={actions.renderSubject()} />;
};
