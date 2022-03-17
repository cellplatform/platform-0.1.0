import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { DEFAULTS, Keyboard, R, rx, t, UIEvent } from './common';

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
  keyboard?: boolean; // Support keyboard interaction (default: true).
  reset$?: Observable<any>;
  ctx: () => { orientation?: t.ListOrientation; total: number };
};

/**
 * Abstract selection monitor.
 */
export function ListSelectionMonitor(args: ListSelectionMonitorArgs) {
  const { instance, multi = false, clearOnBlur = false, allowEmpty = false } = args;

  const bus = rx.busAsType<t.ListEvent>(args.bus);
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  args.reset$?.pipe(takeUntil(dispose$)).subscribe(() => Change.reset());

  const dom = <Ctx extends O>(filter: (ctx: Ctx) => boolean) =>
    UIEvent.Events<Ctx>({ bus, instance, dispose$, filter: (e) => filter(e.payload.ctx) });
  const item = dom<t.CtxItem>((ctx) => ctx.kind === 'Item');
  const list = dom<t.CtxList>((ctx) => ctx.kind === 'List');

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
   * Current State
   */
  let _selection: t.ListSelection = DEFAULTS.selection;
  let _mouse: t.ListMouseState = DEFAULTS.mouse;
  const toState = () => ({ selection: _selection, mouse: _mouse });
  const changed$ = new BehaviorSubject<t.ListSeletionState>(toState());
  const clean = (indexes: Index[]) => R.uniq(indexes.filter((i) => i >= 0)).sort();

  const Change = {
    changed() {
      changed$.next(toState());
    },
    selection(e: t.ListSelection) {
      e = { ...e, indexes: clean(e.indexes) };
      _selection = e;
      Change.changed();
    },
    mouse(e: t.ListMouseState) {
      _mouse = { ...e };
      Change.changed();
    },
    reset() {
      _selection = DEFAULTS.selection;
      _mouse = DEFAULTS.mouse;
      Change.changed();
    },
  };

  /**
   * Selection helpers.
   */
  const Select = {
    clear() {
      Change.selection({ indexes: [] });
    },

    remove(indexes: Index[]) {
      Change.selection({ indexes: _selection.indexes.filter((i) => !indexes.includes(i)) });
    },

    /**
     * Simple single seletion.
     */
    single(index: Index) {
      Change.selection({ indexes: [index] });
    },

    /**
     * Incremental selection/deselection (via META key).
     */
    incremental(index: Index) {
      const existing = _selection.indexes.includes(index);
      if (!existing) {
        // ADD clicked item from selection.
        const indexes = [..._selection.indexes, index];
        Change.selection({ indexes });
      }
      if (existing) {
        // REMOVE existing selected item from selection.
        const indexes = _selection.indexes.filter((item) => item !== index);
        if (indexes.length > 0 || allowEmpty) Change.selection({ indexes });
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
        Change.selection({ indexes });
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
   * Mouse state.
   */
  item.mouse.event('onMouseEnter').subscribe((e) => {
    Change.mouse({ ..._mouse, over: e.ctx.index });
  });

  item.mouse
    .filter(UIEvent.isLeftButton)
    .event('onMouseDown')
    .subscribe((e) => {
      Change.mouse({ ..._mouse, down: e.ctx.index });
    });

  item.mouse
    .filter(UIEvent.isLeftButton)
    .event('onMouseUp')
    .subscribe((e) => {
      if (_mouse.down === e.ctx.index) Change.mouse({ ..._mouse, down: -1 });
    });

  item.mouse.event('onMouseLeave').subscribe((e) => {
    const index = e.ctx.index;
    if (_mouse.down === index) Change.mouse({ ..._mouse, down: -1 });
    if (_mouse.over === index) Change.mouse({ ..._mouse, over: -1 });
  });

  /**
   * Arrow keys.
   */
  keydown$
    .pipe(
      filter((e) => args.keyboard ?? true),
      filter((e) => e.is.arrow || e.key === 'Home' || e.key === 'End'),
    )
    .subscribe((e) => {
      const ctx = args.ctx();
      const { total, orientation = 'y' } = ctx;
      if (total === 0) return;

      const key = e.key;
      const isShift = e.keypress.shiftKey;
      const current = _selection.indexes;

      const change = (index: Index) => {
        const indexes = [index];
        if (!R.equals(current, indexes)) Change.selection({ indexes });
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
    dispose,
    dispose$,
    reset: Change.reset,
    changed$: changed$.asObservable(),
    get state(): t.ListSeletionState {
      return toState();
    },
    get current() {
      return _selection;
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
