import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { t } from '../../common';
import { Host, HostProps } from './Host';

export type ActionHostProps = HostProps & {
  bus: t.EventBus;
  actions: t.DevActionsModelBuilder<any>;
};

/**
 * A wrapper around <Host> that handles triggoring redraws when
 * the [Actions] context data changes.
 */
export const ActionsHost: React.FC<ActionHostProps> = (props) => {
  const { bus, actions } = props;
  const [redraw, setRedraw] = useState<number>(0); // NB: Hack for causing redraws.

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const ns = actions.toModel().ns;
    const changed$ = actions.toEvents().changing$;

    changed$
      .pipe(
        takeUntil(dispose$),
        filter((e) => e.action === 'Dev/Action/ctx'),
        filter((e) => e.to.ns === ns),
      )
      .subscribe((e) => setRedraw((prev) => prev + 1));

    return () => dispose$.next();
  }, [bus, actions]); // eslint-disable-line

  return <Host {...props} subject={actions.renderSubject()} />;
};
