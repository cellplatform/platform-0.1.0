import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { t } from '../common';
import * as util from './util';

/**
 * Strategy for navigating the tree via the keyboard.
 */
export const keyboard: t.TreeviewStrategyKeyboardNavigation = () => {
  const { events, treeview$ } = util.options();

  let tree: t.ITreeState;
  const current = () => util.current(tree);

  const key$ = events.keyboard$.pipe(
    filter((e) => e.keypress.isPressed),
    map((e) => ({ key: e.keypress.key, current: e.current, ...current() })),
  );

  const strategy: t.ITreeviewStrategy = {
    next(e) {
      /**
       * NB: The [tree] is stored temporarily so that the handlers below can be
       *     setup using just simple observable description, and the [tree]
       *     state is essentially beign "injected" in via this call prior to
       *     them running.
       */
      tree = e.tree;
      treeview$.next(e.event);
    },
  };

  const setCurrent$ = new Subject<string>();
  setCurrent$.subscribe((id) => {
    const { get, mutate } = current();
    mutate.current(id);
    mutate.selected(get.children(id)[0]?.id);
  });

  /**
   * BEHAVIOR: Select the first-node when the [HOME] key is pressed.
   */
  key$.pipe(filter((e) => e.key === 'Home')).subscribe((e) => {
    const children = e.get.children(e.current);
    e.mutate.selected(children[0]?.id);
  });

  /**
   * BEHAVIOR: Select the last-node when the [END] key is pressed.
   */
  key$.pipe(filter((e) => e.key === 'End')).subscribe((e) => {
    const children = e.get.children(e.current);
    e.mutate.selected(children[children.length - 1]?.id);
  });

  /**
   * BEHAVIOR: Select the next-node when the [DOWN] arrow-key is pressed.
   */
  key$.pipe(filter((e) => e.key === 'ArrowDown')).subscribe((e) => {
    const select = (next?: t.ITreeNode) => {
      if (next) {
        e.mutate.selected(next.id);
      }
    };

    const selected = e.get.selected;
    const current = e.get.current;

    if (!selected.id) {
      // Nothing yet selected, select first child.
      select(current.children[0]);
    } else {
      const isDirectChild = current.children.some((child) => child.id === selected.id);

      if (isDirectChild) {
        if (selected.props.inline?.isOpen && selected.children.length > 0) {
          return select(selected.children[0]);
        } else {
          return select(current.children[selected.index + 1]);
        }
      } else {
        // Within an open inline "twisty".
        if (selected.isLast) {
          // Step up and out of the "twisty" into the next item of the current list.
          const index = current.children.findIndex((child) => child.id === selected.parent?.id);
          select(current.children[index + 1]);
        } else {
          select((selected.parent?.children || [])[selected.index + 1]);
        }
      }
    }
  });

  /**
   * BEHAVIOR: Select the previous-node when the [UP] arrow-key is pressed.
   */
  key$.pipe(filter((e) => e.key === 'ArrowUp')).subscribe((e) => {
    const select = (next?: t.ITreeNode) => {
      if (next) {
        e.mutate.selected(next.id);
      }
    };

    const selected = e.get.selected;
    const current = e.get.current;

    if (!selected.id) {
      // Nothing yet selected, select last child.
      select(current.children[current.children.length - 1]);
    } else {
      const isDirectChild = current.children.some((child) => child.id === selected.id);

      if (isDirectChild) {
        const prev = selected.prev;
        if (prev?.props.inline?.isOpen && prev.children.length > 0) {
          // The previous item is an open inline "twisty"...select the last node within it.
          const children = prev.children || [];
          select(children[children.length - 1]);
        } else {
          select(prev?.node);
        }
      } else {
        // Within an open inline "twisty".
        if (selected.isFirst) {
          // Step up and out of the "twisty" into the parent.
          const index = current.children.findIndex((child) => child.id === selected.parent?.id);
          select(current.children[index]);
        } else {
          select(selected.prev?.node);
        }
      }
    }
  });

  /**
   * BEHAVIOR: Select the first-node when the [RIGHT] arrow-key is pressed.
   */
  key$
    .pipe(
      filter((e) => e.key === 'ArrowRight'),
      filter((e) => Boolean(e.get.selected)),
      filter((e) => e.get.children(e.get.selected).length > 0),
    )
    .subscribe((e) => {
      const selected = e.get.selected;
      const props = util.props(e.query.findById(selected));
      if (props.inline) {
        if (props.inline.isOpen && props.chevron?.isVisible) {
          setCurrent$.next(selected.id); // Drill-in.
        } else {
          e.mutate.open(selected.id);
        }
      } else {
        setCurrent$.next(selected.id);
      }
    });

  /**
   * BEHAVIOR: Step up to the parent-node when the [LEFT] arrow-key is pressed.
   */
  key$.pipe(filter((e) => e.key === 'ArrowLeft')).subscribe((e) => {
    const selected = e.get.selected;
    const props = util.props(e.query.findById(selected));
    if (props.inline?.isOpen) {
      e.mutate.close(selected.id);
    } else {
      const parent = e.query.parent(e.get.current);
      if (parent) {
        setCurrent$.next(parent.id);
      }
    }
  });

  return strategy;
};
