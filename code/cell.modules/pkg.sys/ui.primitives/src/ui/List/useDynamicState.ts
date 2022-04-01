import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';

import { ListState } from '../List.State';
import { Is, rx, t } from './common';

type Index = number;

/**
 * Safe lifecycle management for constructing a dynamic state-monitor for the list.
 */
export function useDynamicState(args: {
  total: number;
  props: t.ListProps;
  selection?: t.ListSelectionConfig;
}) {
  const { total, props, selection } = args;
  const { instance, orientation } = props;
  const { multi, clearOnBlur, allowEmpty, keyboard } = selection ?? {};
  const bus = instance?.bus;
  const id = instance?.id ?? '';

  const [state, setState] = useState<t.ListStateLazy | undefined>();

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();
    if (bus) {
      const getCtx = (): t.ListStateCtx => ({ orientation, total });
      const monitor = ListState.Monitor({
        instance,
        getCtx,
        selection: { multi, clearOnBlur, allowEmpty, keyboard },
      });

      setState(monitor.lazy);
      dispose$.subscribe(monitor.dispose);
    }

    return () => dispose$.next();
  }, [bus, instance, total, orientation, multi, clearOnBlur, allowEmpty, keyboard]);

  /**
   * API
   
   */
  return {
    instance: { bus: bus ? rx.bus.instance(bus) : '', id },
    state,
  };
}

/**
 * Dynamic state effect for a single item.
 */
export function useDynamicItemState(args: {
  index: Index;
  total: number;
  orientation: t.ListOrientation;
  bullet: { edge: t.ListBulletEdge };
  state?: t.ListStateLazy;
}) {
  type S = t.ListState | undefined;
  const { index, total, orientation, bullet } = args;
  const { edge } = bullet;

  const toFlags = (state?: S) => {
    return Is.toItemFlags({ index, total, state, orientation, bullet: { edge } });
  };

  const [state, setState] = useState<S>();
  const [is, setIs] = useState<t.ListBulletRenderFlags>(toFlags());

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const Selection = ListState.Selection;
    const dispose$ = new Subject<void>();

    if (args.state) {
      const updateState = (fn: (prev: S) => S) => {
        setState((prev) => {
          const state = fn(prev);
          setIs(toFlags(state));
          return state;
        });
      };

      const changed$ = args.state.changed$.pipe(takeUntil(dispose$));
      const mouse$ = changed$.pipe(
        filter((e) => e.kind === 'Mouse'),
        map((e) => e.change as t.ListMouseChange),
        filter((e) => e.index === index),
      );

      const selection$ = changed$.pipe(
        filter((e) => e.kind === 'Selection'),
        map((e) => e.change as t.ListSelectionState),
        map((selection) => ({
          selection,
          isSelected: Selection.isSelected(selection.indexes, index),
        })),
        distinctUntilChanged((prev, next) => {
          if (prev.isSelected !== next.isSelected) return false;
          return prev.isSelected ? prev.selection.isFocused === next.selection.isFocused : true;
        }),
      );

      mouse$.subscribe((e) => {
        const mouse = e.state;
        updateState((prev) => ({ ...prev, mouse }));
      });

      selection$.subscribe(({ selection }) => {
        updateState((prev) => ({ ...prev, selection }));
      });
    }

    return () => dispose$.next();
  }, [index, total, orientation, edge]); // eslint-disable-line

  /**
   * API
   */
  return { index, state, is };
}
