import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { css, rx, t, useActionItemMonitor } from '../common';

export type ComponentProps = {
  namespace: string;
  bus: t.EventBus;
  item: t.ActionComponent;
};

export const Component: React.FC<ComponentProps> = (props) => {
  const { namespace, bus } = props;
  const id = props.item.id;
  const item = useActionItemMonitor({ bus, item: props.item });
  const { element } = useComponentRenderMonitor({ bus, namespace, id });

  if (!item.handler || !element) return null;

  const styles = {
    base: css({ position: 'relative', boxSizing: 'border-box' }),
  };

  return <div {...styles.base}>{element}</div>;
};

/**
 * State hook for monitoring render updates.
 */
export function useComponentRenderMonitor(args: {
  bus: t.EventBus<any>;
  namespace: string;
  id: string;
}) {
  const { namespace, id } = args;
  const bus = args.bus as t.EventBus<t.DevActionEvent>;
  const [element, setElement] = useState<JSX.Element | null>();

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = bus.$.pipe(
      takeUntil(dispose$),
      filter((e) => e.payload.namespace === namespace),
    );

    rx.payload<t.IActionComponentRenderEvent>($, 'sys.ui.dev/action/Component/render')
      .pipe(filter((e) => e.item.id === id))
      .subscribe((e) => setElement(e.element));

    return () => dispose$.next();
  }, [bus, id, namespace]);

  return { element };
}
