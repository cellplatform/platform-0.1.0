import { Subject } from 'rxjs';
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
  onChange?: (e: { selection: t.ListSelection; mouse: t.ListMouseState }) => void;
};

/**
 * Abstract selection monitor.
 */
export function ListSelectionMonitor(args: ListSelectionMonitorArgs) {
  const { instance, multi = false, clearOnBlur = false, allowEmpty = false } = args;

  const bus = rx.busAsType<t.ListEvent>(args.bus);
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();

  const dom = <Ctx extends O>(filter: (ctx: Ctx) => boolean) =>
    UIEvent.Events<Ctx>({ bus, instance, dispose$, filter: (e) => filter(e.payload.ctx) });
  const item = dom<t.CtxItem>((ctx) => ctx.kind === 'Item');
  const list = dom<t.CtxList>((ctx) => ctx.kind === 'List');

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
  let _selection: t.ListSelection = { indexes: [] };
  let _mouse: t.ListMouseState = { over: -1, down: -1 };
  const changed$ = new Subject<void>();
  const clean = (indexes: Index[]) => R.uniq(indexes.filter((i) => i >= 0)).sort();

  const Change = {
    changed() {
      changed$.next();
      args.onChange?.({ selection: _selection, mouse: _mouse });
    },
    selection(e: t.ListSelection) {
      e = { ...e, indexes: clean(e.indexes) };
      _selection = e;
      Change.changed();
    },
    mouse(e: t.ListMouseState) {
      _mouse = { ...e };
      changed$.next();
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
  keyboard$
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
    const index = e.ctx.index;
    Change.mouse({ ..._mouse, over: index });
  });

  item.mouse
    .filter(UIEvent.isLeftButton)
    .event('onMouseDown')
    .subscribe((e) => {
      const index = e.ctx.index;
      Change.mouse({ ..._mouse, down: index });
    });

  item.mouse
    .filter(UIEvent.isLeftButton)
    .event('onMouseUp')
    .subscribe((e) => {
      const index = e.ctx.index;
      if (_mouse.down === index) Change.mouse({ ..._mouse, down: -1 });
    });

  item.mouse.event('onMouseLeave').subscribe((e) => {
    const index = e.ctx.index;
    if (_mouse.down === index) Change.mouse({ ..._mouse, down: -1 });
    if (_mouse.over === index) Change.mouse({ ..._mouse, over: -1 });
  });

  /**
   * API
   */
  return {
    dispose,
    dispose$,
    multi,
    changed$: changed$.asObservable(),
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
