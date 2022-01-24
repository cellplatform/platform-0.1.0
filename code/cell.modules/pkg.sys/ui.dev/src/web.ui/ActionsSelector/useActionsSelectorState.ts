import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { rx, t } from '../../common';

/**
 * Monitor the state of a <Select> dropdown of a set of actions
 * and update a React state object, and store within a persistent store.
 */
export function useActionsSelectorState(args: {
  bus: t.EventBus;
  actions?: t.Actions[];
  store?: t.ActionsSelectStore;
  initial?: t.Namespace;
}) {
  const store = args.store;
  const list = args.actions || [];
  const bus = args.bus as t.EventBus<t.DevEvent>;

  const [selected, setSelected] = useState<t.Actions>();

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = bus.$.pipe(takeUntil(dispose$));

    const Find = {
      namespace: (ns: string) => list.find((a) => a.toObject().namespace === ns),
      initial() {
        const first = list[0];
        return args.initial ? Find.namespace(args.initial) ?? first : first;
      },
    };

    // Set initial state.
    if (!store) setSelected(Find.initial());
    if (store) store().then((e) => setSelected(e && !args.initial ? e : Find.initial()));

    // Monitor for changes to the dropdown.
    rx.payload<t.ActionsSelectChangedEvent>($, 'sys.ui.dev/actions/select/changed')
      .pipe()
      .subscribe((e) => {
        const current = Find.namespace(e.namespace);

        setSelected((prev) => {
          if (prev) {
            const model = prev.toModel();
            const namespace = model.state.namespace;
            bus.fire({ type: 'sys.ui.dev/actions/dispose', payload: { namespace } });
          }

          return current;
        });

        if (store) store(current);
      });

    return () => dispose$.next();
  }, [bus, list]); // eslint-disable-line

  return { list, selected };
}
