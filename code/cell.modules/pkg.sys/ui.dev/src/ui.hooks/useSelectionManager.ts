import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { rx, t } from '../common';

const KEY = 'dev';

/**
 * Keeps a query string updated with the currently selected module "namespace".
 */
export function useSelectionManager(args: { bus: t.EventBus<any>; actions: t.Actions[] }) {
  const { actions = [] } = args;
  const bus = rx.busAsType<t.DevEvent>(args.bus);

  const Find = {
    fromNamespace: (value: string) => actions.find((a) => a.toObject().namespace === value),
    fromQuery(href: string) {
      const url = new URL(href);
      const value = url.searchParams.get(KEY);
      return value ? Find.fromNamespace(value) : undefined;
    },
  };

  const [selected, setSelected] = useState<t.Actions | undefined>();

  const toNamespace = (actions?: t.Actions) => actions?.toModel().state.namespace ?? '';

  const disposeOf = (actions?: t.Actions) => {
    if (!actions) return;
    bus.fire({
      type: 'sys.ui.dev/actions/dispose',
      payload: { namespace: toNamespace(actions) },
    });
  };

  const select = (current?: t.Actions) => {
    setSelected((prev) => {
      disposeOf(prev);
      return current;
    });

    const url = new URL(location.href);
    const namespace = toNamespace(current);
    if (namespace) url.searchParams.set(KEY, namespace);
    window.history.pushState({}, '', url);
  };

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = bus.$.pipe(takeUntil(dispose$));

    /**
     * Selection changed (by user)
     */
    rx.payload<t.ActionsSelectChangedEvent>($, 'sys.ui.dev/actions/select/changed')
      .pipe()
      .subscribe((e) => select(Find.fromNamespace(e.namespace)));

    /**
     * Initial selection.
     */
    select(Find.fromQuery(location.href) ?? actions[0]);

    return () => dispose$.next();
  }, [bus, actions]); // eslint-disable-line

  /**
   * API
   */
  return { selected };
}
