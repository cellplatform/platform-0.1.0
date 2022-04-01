import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { Keyboard, R, rx, t, UIEvent } from '../common';
import { ListSelection } from './ListSelection';

/**
 * Types
 */
type O = Record<string, unknown>;
type Index = number;

export type ListSelectionMonitorArgs = {
  instance: t.ListInstance;
  config?: t.ListSelectionConfig;
  reset$?: Observable<any>;
  getCtx: () => t.ListStateCtx;
};

/**
 * Abstract selection monitor.
 */
export function ListSelectionMonitor(args: ListSelectionMonitorArgs) {
  const { instance, config = {} } = args;
  const { multi = false, clearOnBlur = false, allowEmpty = false } = config;
  const bus = rx.busAsType<t.ListEvent>(instance.bus);
  const id = instance.id;

  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  args.reset$?.pipe(takeUntil(dispose$)).subscribe(() => Change.reset());

  const dom = <Ctx extends O>(filter: (ctx: Ctx) => boolean) =>
    UIEvent.Events<Ctx>({
      bus,
      instance: id,
      dispose$,
      filter: (e) => filter(e.payload.ctx),
    });
  const item = dom<t.CtxItem>((ctx) => ctx.kind === 'Item');
  const list = dom<t.CtxList>((ctx) => ctx.kind === 'List');

  /**
   * Current State
   */
  let _selection: t.ListSelectionState = { indexes: [], isFocused: false };
  const changed$ = new Subject<t.ListSelectionState>();

  /**
   * List focus state.
   */
  list.focus.event('onFocus').subscribe(() => Change.focus(true));
  list.focus.event('onBlur').subscribe(() => Change.focus(false));

  /**
   * Keyboard state.
   */
  const keyboard = Keyboard.State.singleton(bus);
  const keyboardState$ = keyboard.state$.pipe(takeUntil(dispose$));
  const keydown$ = keyboard.keypress$.pipe(
    takeUntil(dispose$),
    filter((e) => e.is.down),
  );

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
   * State change helpers.
   */
  const Change = {
    changed() {
      changed$.next(_selection);
    },
    selection(indexes: t.ListSelection) {
      _selection = { ..._selection, indexes: ListSelection.clean(indexes) };
      Change.changed();
    },
    focus(isFocused: boolean) {
      _selection = { ..._selection, isFocused };
      Change.changed();
    },
    reset() {
      _selection = { ..._selection, indexes: [] };
      Change.changed();
    },
  };

  /**
   * Selection helpers.
   */
  const Select = {
    clear() {
      Change.selection([]);
    },

    remove(indexes: Index[]) {
      Change.selection(_selection.indexes.filter((i) => !indexes.includes(i)));
    },

    /**
     * Simple single seletion.
     */
    single(index: Index) {
      Change.selection([index]);
    },

    /**
     * Incremental selection/deselection (via META key).
     */
    incremental(index: Index) {
      const existing = _selection.indexes.includes(index);
      if (!existing) {
        // ADD clicked item from selection.
        const indexes = [..._selection.indexes, index];
        Change.selection(indexes);
      }
      if (existing) {
        // REMOVE existing selected item from selection.
        const indexes = _selection.indexes.filter((item) => item !== index);
        if (indexes.length > 0 || allowEmpty) Change.selection(indexes);
      }
    },

    /**
     * Select a sequential block of items.
     */
    block(index: Index) {
      const fill = (start: Index, end: Index) => {
        if (start < 0) return;
        const next = new Array(end - start + 1).fill(true).map((v, i) => i + start);
        const indexes = [..._selection.indexes, ...next];
        Change.selection(indexes);
        if (ShiftKey.current) ShiftKey.current.prev = indexes;
      };

      if (!ShiftKey.current) {
        /**
         * Initial click within SHIFT translaction.
         */
        const before = Find.closestPreviousSelection(_selection, index);
        ShiftKey.current = {
          anchor: before < 0 ? index : before,
          prev: [],
        };
        if (before < 0) fill(index, Find.closestNextSelection(_selection, index));
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
  keyboardState$
    .pipe(
      distinctUntilChanged((prev, next) => ShiftKey.isPressed(prev) === ShiftKey.isPressed(next)),
      filter((e) => !ShiftKey.isPressed(e)),
    )
    .subscribe(() => (ShiftKey.current = undefined));

  /**
   * Adjust selection on mouse-clicks.
   */
  item.mouse
    .filter(UIEvent.isLeftButton)
    .event('onMouseDown')
    .subscribe((e) => {
      const { index } = e.ctx;
      const { metaKey, shiftKey } = e.mouse;
      if (!multi || !(metaKey || shiftKey)) return Select.single(index);
      if (multi && metaKey) return Select.incremental(index);
      if (multi && shiftKey) return Select.block(index);
    });

  /**
   * Arrow keys.
   */
  keydown$
    .pipe(
      filter(() => _selection.isFocused),
      filter((e) => config.keyboard ?? true),
      filter((e) => e.is.arrow || e.key === 'Home' || e.key === 'End'),
    )
    .subscribe((e) => {
      const ctx = args.getCtx();
      const { total, orientation = 'y' } = ctx;
      if (total === 0) return;

      const key = e.key;
      const isShift = e.keypress.shiftKey;
      const current = _selection.indexes;

      const change = (index: Index) => {
        const indexes = [index];
        if (!R.equals(current, indexes)) Change.selection(indexes);
      };

      const isPrev = orientation === 'y' ? key === 'ArrowUp' : key === 'ArrowLeft';
      const isNext = orientation === 'y' ? key === 'ArrowDown' : key === 'ArrowRight';

      if (isPrev || isNext) {
        if (current.length === 0) {
          // Nothing selected, start at [Beginning] or [End].
          return change(isNext ? 0 : total - 1);
        }
        if (isPrev) {
          return change(Math.max(0, current[0] - 1));
        }
        if (isNext) {
          const index = current[current.length - 1] + 1;
          return change(Math.min(total - 1, index));
        }
      }

      if (key === 'Home') return change(0);
      if (key === 'End') return change(total - 1);

      /**
       * TODO 🐷 KEYBOARD
       * - scroll to item (ensure visible)
       * - SHIFT additive selection.
       * - Only change keyboard when list is focused.
       */
    });

  /**
   * API
   */
  return {
    instance: { bus: rx.bus.instance(bus), id },
    dispose,
    dispose$,
    changed$: changed$.asObservable(),
    get state(): t.ListSelectionState {
      return _selection;
    },
  };
}

/**
 * Helpers
 */

const Find = {
  closestPreviousSelection(selection: t.ListSelectionState, subject: Index) {
    if (selection.indexes.length === 0) return 0;
    const list = selection.indexes.filter((e) => e < subject).reverse();
    return list[0] ?? -1;
  },
  closestNextSelection(selection: t.ListSelectionState, subject: Index) {
    const list = selection.indexes.filter((e) => e > subject).reverse();
    return list[0] ?? -1;
  },
};
