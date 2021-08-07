import { useEffect, useState } from 'react';
import { filter, takeUntil } from 'rxjs/operators';

import { t, Tree } from '../common';

export function useDefaultTreeviewStrategy(args: {
  bus: t.EventBus<t.TreeviewEvent>;
  isEnabled: boolean;
  initial: t.ITreeviewNode;
}) {
  const { bus, isEnabled, initial } = args;
  const [root, setRoot] = useState<t.ITreeviewNode | undefined>();
  const [current, setCurrent] = useState<string | undefined>();

  useEffect(() => {
    const tree = Tree.State.create({ root: initial });
    const $ = bus.$.pipe(
      takeUntil(tree.dispose$),
      filter(() => isEnabled),
    );

    const updateState = () => {
      if (isEnabled) {
        const nav = tree.state.props?.treeview?.nav ?? {};
        setCurrent(nav.current);
        setRoot(tree.state);
      }
    };

    /**
     * State behavior strategy.
     */
    const strategy = Tree.Strategy.default(bus);

    $.subscribe((event) => {
      strategy.next({ tree, event });
      updateState();
    });

    /**
     * Dispose
     */
    updateState();
    return () => tree.dispose();
  }, [bus, isEnabled, initial]); // eslint-disable-line

  return {
    root: isEnabled ? root : undefined,
    current: isEnabled ? current : undefined,
  };
}
