import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { R, rx, t, UIEvents } from './common';

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
};

/**
 * Abstract selection monitor.
 */
export function ListSelectionMonitor(args: ListSelectionMonitorArgs) {
  const { instance, multi = false, clearOnBlur = false } = args;

  const bus = rx.busAsType<t.ListEvent>(args.bus);
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();

  let current: t.ListSelection = { indexes: [] };
  const changed$ = new BehaviorSubject<t.ListSelection>(current);
  const change = (e: t.ListSelection) => {
    const indexes = R.uniq(e.indexes).sort();
    e = { ...e, indexes };
    current = e;
    changed$.next(e);
  };

  const dom = <Ctx extends O>(filter: (ctx: Ctx) => boolean) => {
    return UIEvents<Ctx>({ bus, instance, dispose$, filter: (e) => filter(e.payload.ctx) });
  };

  const item = dom<t.CtxItem>((ctx) => ctx.kind === 'Item');
  const list = dom<t.CtxList>((ctx) => ctx.kind === 'List');

  /**
   * Clear selection when list loses focus.
   */
  list.focus
    .event('onBlur')
    .pipe(filter(() => Boolean(args.clearOnBlur)))
    .subscribe((e) => {
      change({ indexes: [] }); // Reset.
    });

  /**
   * Adjust selection on mouse-click.
   */
  item.mouse.event('onMouseDown').subscribe((e) => {
    const { index } = e.ctx;
    const { metaKey, shiftKey } = e.mouse;

    if (!multi || !(metaKey || shiftKey)) {
      change({ indexes: [index] });
      return;
    }

    if (multi) {
      /**
       * META Modifier Key
       */
      if (metaKey) {
        const alreadySelected = current.indexes.includes(index);
        if (alreadySelected) {
          // Remove clicked item from selection.
          const indexes = current.indexes.filter((item) => item !== index);
          change({ indexes });
        } else {
          // Add clicked item from selection.
          const indexes = [...current.indexes, index];
          change({ indexes });
        }
      }

      /**
       * SHIFT Modifier Key
       */
      if (shiftKey) {
        const prev = Find.closestPreviousSelection(current, index);

        const fill = (start: Index, end: Index) => {
          if (start >= 0) {
            console.log('fill', start, end);

            const indexes = new Array(end - start + 1).fill(true).map((v, i) => i + start);
            change({ indexes: [...current.indexes, ...indexes] });
          }
        };

        if (prev < 0) {
          // Select behind.
          const next = Find.closestNextSelection(current, index);
          fill(index, next);
        }

        if (prev >= 0) {
          // Select ahead of current selection.
          fill(prev + 1, index);
        }
      }
    }
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
