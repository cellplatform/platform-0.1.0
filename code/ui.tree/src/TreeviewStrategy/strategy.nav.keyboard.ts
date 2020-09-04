import { TreeIdentity } from '@platform/state';
import { filter, map } from 'rxjs/operators';

import { t } from '../common';
import * as util from './util';

type N = t.ITreeviewNode;

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
    filter((e) => !e.isHandled),
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
    const { selected } = e.get;
    if (selected.isFirst && selected.parent.isInlineAndOpen) {
      const next = selected.parent.parent.children[0];
      if (next) {
        select(next);
      }
    } else {
      select(selected.parent.children[0]);
    }
  });

  /**
   * BEHAVIOR: Select the last-node when the [END] key is pressed.
   */
  key$.pipe(filter((e) => e.key === 'End')).subscribe((e) => {
    const { selected } = e.get;
    if (selected.isLast && selected.parent.isInlineAndOpen) {
      const children = selected.parent.parent.children;
      const next = children[children.length - 1];
      if (next) {
        select(next);
      }
    } else {
      const children = selected.parent.children;
      select(children[children.length - 1]);
    }
  });

  /**
   * BEHAVIOR: Select the previous-node when the [UP] arrow-key is pressed.
   */
  key$.pipe(filter((e) => e.key === 'ArrowUp')).subscribe((e) => {
    const { selected, current } = e.get;
    if (!selected.id) {
      // Nothing yet selected, select last child.
      select(current.children[current.children.length - 1]);
    } else {
      const prev = selected.prev;
      if (prev) {
        select(prev.isInlineAndOpen ? prev.deepestOpenChild('LAST') : prev);
      } else {
        if (selected.parent.isInlineAndOpen) {
          select(selected.parent);
        }
      }
    }
  });

  /**
   * BEHAVIOR: Select the next-node when the [DOWN] arrow-key is pressed.
   */
  key$.pipe(filter((e) => e.key === 'ArrowDown')).subscribe((e) => {
    const { selected } = e.get;
    if (!selected.id) {
      // Nothing yet selected, select first child.
      select(e.get.current.children[0]);
    } else {
      if (selected.isInlineAndOpen) {
        select(selected.children[0]);
      } else {
        if (!selected.isLast) {
          select(selected.parent.children[selected.index + 1]);
        } else {
          const parent = selected.nearestNonLastAncestor;
          if (parent && parent.index > -1 && parent.parent) {
            select(parent.parent.children[parent.index + 1]);
          }
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
    const { selected, current } = e.get;
    if (selected.isInlineAndOpen) {
      e.mutate.close(selected.id);
    } else if (selected.parent.isInlineAndOpen) {
      e.mutate.close(selected.parent.id);
      selection({ current: e.current, selected: selected.parent.id });
    } else {
      const parent = current.parent;
      if (parent && !current.isRoot && !parent.isInlineAndOpen) {
        selection({ current: parent.id, selected: e.current });
      }
    }
  });

  return strategy;
};
