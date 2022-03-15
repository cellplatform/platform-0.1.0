import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil, distinctUntilChanged } from 'rxjs/operators';

import { R, rx, t, UIEvent, Keyboard } from './common';

/**
 * Types
 */
type O = Record<string, unknown>;
type Id = string;
type Index = number;

export type ListSelectionMonitorArgs = {
  bus: t.EventBus<any>;
  instance: Id;
  multi?: boolean; // Allow selection of multiple items.
  clearOnBlur?: boolean;
  allowEmpty?: boolean;
  onChange?: (e: t.ListSelection) => void;
};

/**
 * Abstract selection monitor.
 */
export function ListSelectionMonitor(args: ListSelectionMonitorArgs) {
  const { instance, multi = false, clearOnBlur = false, allowEmpty = false } = args;

  const bus = rx.busAsType<t.ListEvent>(args.bus);
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();

  /**
   * Keyboard state.
   */
  const keyboard = Keyboard.State.singleton(bus);
  const keyboard$ = keyboard.state$.pipe(takeUntil(dispose$));

  /**
   * SHIFT state.
   */
  type ShiftOperation = { anchor: Index; prev: Index[] };
  const ShiftKey = {
    current: undefined as ShiftOperation | undefined,
    isPressed: (state: t.KeyboardState) => Boolean(state.current.modifiers.shift),
    init: (anchor: Index) => (ShiftKey.current = { anchor, prev: [] }),
  };

  /**
   * Current State
   */
  let current: t.ListSelection = { indexes: [] };
  const changed$ = new BehaviorSubject<t.ListSelection>(current);
  const change = (e: t.ListSelection) => {
    const indexes = R.uniq(e.indexes.filter((i) => i >= 0)).sort();
    e = { ...e, indexes };
    current = e;
    changed$.next(e);
    args.onChange?.(e);
  };

  /**
   * Selection helpers.
   */
  const Select = {
    clear() {
      change({ indexes: [] });
    },

    remove(indexes: Index[]) {
      change({ indexes: current.indexes.filter((i) => !indexes.includes(i)) });
    },

    /**
     * Simple single seletion.
     */
    single(index: Index) {
      change({ indexes: [index] });
    },

    /**
     * Incremental selection/deselection (via META key).
     */
    incremental(index: Index) {
      const existing = current.indexes.includes(index);
      if (!existing) {
        // ADD clicked item from selection.
        const indexes = [...current.indexes, index];
        change({ indexes });
      }
      if (existing) {
        // REMOVE existing selected item from selection.
        const indexes = current.indexes.filter((item) => item !== index);
        if (indexes.length > 0 || allowEmpty) change({ indexes });
      }
    },

    /**
     * Select a sequential block of items.
     */
    block(index: Index) {
      const fill = (start: Index, end: Index) => {
        if (start < 0) return;
        const next = new Array(end - start + 1).fill(true).map((v, i) => i + start);
        const indexes = [...current.indexes, ...next];
        change({ indexes });
        if (ShiftKey.current) ShiftKey.current.prev = indexes;
      };

      if (!ShiftKey.current) {
        /**
         * Initial click within SHIFT translaction.
         */
        const before = Find.closestPreviousSelection(current, index);
        ShiftKey.current = {
          anchor: before < 0 ? index : before,
          prev: [],
        };
        if (before < 0) fill(index, Find.closestNextSelection(current, index));
        if (before >= 0) fill(before + 1, index);
      } else {
        /**
         * Secondary click within SHIFT transaction.
         */
        Select.remove(ShiftKey.current.prev);
        const { anchor } = ShiftKey.current;
        if (index < anchor) fill(index, anchor);
        if (index > anchor) fill(anchor, index);
      }
    },
  };

  const dom = <Ctx extends O>(filter: (ctx: Ctx) => boolean) => {
    return UIEvent.Events<Ctx>({ bus, instance, dispose$, filter: (e) => filter(e.payload.ctx) });
  };

  const item = dom<t.CtxItem>((ctx) => ctx.kind === 'Item');
  const list = dom<t.CtxList>((ctx) => ctx.kind === 'List');

  /**
   * Clear selection when list loses focus.
   */
  list.focus
    .event('onBlur')
    .pipe(filter(() => Boolean(clearOnBlur)))
    .subscribe(() => Select.clear());

  /**
   * Clear current [ShiftKey] operation on key-up.
   */
  keyboard$
    .pipe(
      distinctUntilChanged((prev, next) => ShiftKey.isPressed(prev) === ShiftKey.isPressed(next)),
      filter((e) => !ShiftKey.isPressed(e)),
    )
    .subscribe(() => (ShiftKey.current = undefined));

  /**
   * Adjust selection on mouse-clicks.
   */
  item.mouse.event('onMouseDown').subscribe((e) => {
    const { index } = e.ctx;
    const { metaKey, shiftKey } = e.mouse;
    if (!multi || !(metaKey || shiftKey)) return Select.single(index);
    if (multi && metaKey) return Select.incremental(index);
    if (multi && shiftKey) return Select.block(index);
  });

  /**
   * API
   */
  return {
    dispose,
    dispose$,
    changed$: changed$.asObservable(),
    multi,
    get current() {
      return current;
    },
  };
}

/**
 * Helpers
 */

const Find = {
  closestPreviousSelection(selection: t.ListSelection, subject: Index) {
    if (selection.indexes.length === 0) return 0;
    const list = selection.indexes.filter((e) => e < subject).reverse();
    return list[0] ?? -1;
  },
  closestNextSelection(selection: t.ListSelection, subject: Index) {
    const list = selection.indexes.filter((e) => e > subject).reverse();
    return list[0] ?? -1;
  },
};
