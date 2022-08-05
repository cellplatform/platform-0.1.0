import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';

import { ListState } from '../List.State';
import { ListIs, rx, t } from './common';
import { Wrangle } from './Wrangle';

type Index = number;

/**
 * Safe lifecycle management for constructing a dynamic state-monitor for the list.
 */
export function useDynamicState(args: {
  total: number;
  instance?: t.ListInstance;
  orientation?: t.ListOrientation;
  selectable?: t.ListSelectionConfig | boolean;
}) {
  const { total, instance, orientation } = args;
  const { multi, clearOnBlur, allowEmpty, keyboard } = Wrangle.selection(args.selectable);
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
        getCtx,
        instance,
        selection: { multi, clearOnBlur, allowEmpty, keyboard },
        initial: state?.get(),
      });

      setState(monitor.lazy);
      dispose$.subscribe(monitor.dispose);
    }

    return () => rx.done(dispose$);
  }, [bus, instance, total, orientation, multi, clearOnBlur, allowEmpty, keyboard]); // eslint-disable-line

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
  const selectionConfig = args.state?.selection;

  const [state, setState] = useState<S>(args.state?.get());

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const Selection = ListState.Selection;
    const dispose$ = new Subject<void>();

    if (args.state) {
      const changed$ = args.state.changed$.pipe(takeUntil(dispose$));
      const mouse$ = changed$.pipe(
        filter((e) => e.kind === 'Mouse'),
        map((e) => e.change as t.ListMouseChange),
        filter((e) => e.index === index),
      );

      const selection$ = changed$.pipe(
        filter((e) => isSelectionConfigured(selectionConfig)),
        filter((e) => e.kind === 'Selection'),
        map((e) => e.change as t.ListSelectionState),
        map((selection) => ({
          selection,
          isSelected: Selection.isSelected(selection.indexes, index),
          isPrevSelected: Selection.isSelected(selection.indexes, index - 1),
          isNextSelected: Selection.isSelected(selection.indexes, index + 1),
        })),
        distinctUntilChanged((prev, next) => {
          if (prev.isSelected !== next.isSelected) return false;
          if (prev.isPrevSelected !== next.isPrevSelected) return false;
          if (prev.isNextSelected !== next.isNextSelected) return false;
          if (prev.isSelected) {
            return prev.selection.isFocused === next.selection.isFocused;
          }
          return true;
        }),
      );

      mouse$.subscribe((e) => {
        const mouse = e.state;
        setState((prev) => ({ ...prev, mouse }));
      });

      selection$.subscribe(({ selection }) => {
        setState((prev) => ({ ...prev, selection }));
      });
    }

    return () => rx.done(dispose$);
  }, [index, total, orientation, edge, selectionConfig]); // eslint-disable-line

  /**
   * API
   */
  return {
    index,
    state,
    get is() {
      return ListIs.toItemFlags({
        index,
        total,
        orientation,
        bullet: { edge },
        state: () => state,
      });
    },
  };
}

/**
 * Helpers
 */

function isSelectionConfigured(config?: t.ListSelectionConfig) {
  if (!config) return false;
  return Object.values(config).filter((value) => value !== undefined).length > 0;
}
