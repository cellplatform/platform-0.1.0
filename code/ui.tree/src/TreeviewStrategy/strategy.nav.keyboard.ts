import { TreeIdentity } from '@platform/state';
import { filter, map } from 'rxjs/operators';

import { t } from '../common';
import * as util from './util';

/**
 * Strategy for navigating the tree via the keyboard.
 */
export const keyboard: t.TreeviewStrategyKeyboardNavigation = (args) => {
  const { events, treeview$ } = util.options();
  const { fire } = args;

  let tree: t.ITreeviewState;
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

  const select = (node?: t.NodeIdentifier) => {
    const selected = TreeIdentity.toNodeId(node);
    fire({ type: 'TREEVIEW/select', payload: { selected } });
  };

  const selection = (args: { selected?: t.NodeIdentifier; current?: t.NodeIdentifier }) => {
    const { get } = util.current(tree);
    const current = TreeIdentity.toNodeId(args.current);
    const selected = TreeIdentity.toNodeId(args.selected) || get.children(current)[0]?.id;
    fire({ type: 'TREEVIEW/select', payload: { selected, current } });
  };

  /**
   * BEHAVIOR: Select the first-node when the [HOME] key is pressed.
   */
  key$.pipe(filter((e) => e.key === 'Home')).subscribe((e) => {
    const children = e.get.children(e.current);
    select(children[0]);
  });

  /**
   * BEHAVIOR: Select the last-node when the [END] key is pressed.
   */
  key$.pipe(filter((e) => e.key === 'End')).subscribe((e) => {
    const children = e.get.children(e.current);
    select(children[children.length - 1]);
  });

  /**
   * BEHAVIOR: Select the next-node when the [DOWN] arrow-key is pressed.
   */
  key$.pipe(filter((e) => e.key === 'ArrowDown')).subscribe((e) => {
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
          selection({ current: selected.id }); // Drill-in.
        } else {
          e.mutate.open(selected.id);
        }
      } else {
        selection({ current: selected.id });
      }
    });

  /**
   * BEHAVIOR: Step up to the parent-node when the [LEFT] arrow-key is pressed.
   */
  key$.pipe(filter((e) => e.key === 'ArrowLeft')).subscribe((e) => {
    const selected = e.get.selected;
    if (selected.props.inline?.isOpen) {
      e.mutate.close(selected.id);
    } else if (
      util.props(selected.parent).inline?.isOpen &&
      e.query.parent(selected.parent)?.id === e.current
    ) {
      e.mutate.close(selected.parent.id);
      selection({ current: e.current, selected: selected.parent.id });
    } else {
      const parent = e.query.parent(e.get.current);
      if (parent) {
        selection({ current: parent.id, selected: e.current });
      }
    }
  });

  return strategy;
};
