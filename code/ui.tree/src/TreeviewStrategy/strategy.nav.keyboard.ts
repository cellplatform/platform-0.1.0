import { filter } from 'rxjs/operators';

import { t } from '../common';
import * as util from './util';

/**
 * Strategy for navigating the tree via the keyboard.
 */
export const keyboard: t.TreeviewStrategyKeyboardNavigation = (args) => {
  const { tree, events, mutate, strategy } = util.args(args);
  const key$ = events.keyboard$.pipe(filter((e) => e.keypress.isPressed));

  const get = util.get(tree);
  const query = get.query;

  const setCurrent = (id?: string) => {
    mutate.current(id);
    mutate.selected(get.children(id)[0]?.id);
  };

  /**
   * BEHAVIOR: Select the first-node when the [HOME] key is pressed.
   */
  key$.pipe(filter((e) => e.keypress.key === 'Home')).subscribe((e) => {
    const children = get.children(e.current);
    mutate.selected(children[0]?.id);
  });

  /**
   * BEHAVIOR: Select the last-node when the [END] key is pressed.
   */
  key$.pipe(filter((e) => e.keypress.key === 'End')).subscribe((e) => {
    const children = get.children(e.current);
    mutate.selected(children[children.length - 1]?.id);
  });

  /**
   * BEHAVIOR: Select the next-node when the [DOWN] arrow-key is pressed.
   */
  key$.pipe(filter((e) => e.keypress.key === 'ArrowDown')).subscribe((e) => {
    const selected = get.selected;
    const children = get.children(e.current);
    if (!selected) {
      mutate.selected(children[0]?.id);
    } else {
      const index = children.findIndex((child) => child.id === selected);
      const node = children[index + 1];
      if (node) {
        mutate.selected(node.id);
      }
    }
  });

  /**
   * BEHAVIOR: Select the previous-node when the [UP] arrow-key is pressed.
   */
  key$.pipe(filter((e) => e.keypress.key === 'ArrowUp')).subscribe((e) => {
    const selected = get.selected;
    const children = get.children(e.current);
    if (!selected) {
      mutate.selected(children[children.length - 1]?.id);
    } else {
      const index = children.findIndex((child) => child.id === selected);
      const node = children[index - 1];
      if (node) {
        mutate.selected(node.id);
      }
    }
  });

  /**
   * BEHAVIOR: Select the first-node when the [RIGHT] arrow-key is pressed.
   */
  key$
    .pipe(
      filter((e) => e.keypress.key === 'ArrowRight'),
      filter((e) => Boolean(get.selected)),
      filter((e) => get.children(get.selected).length > 0),
    )
    .subscribe((e) => {
      setCurrent(get.selected);
    });

  /**
   * BEHAVIOR: Step up to the parent-node when the [LEFT] arrow-key is pressed.
   */
  key$.pipe(filter((e) => e.keypress.key === 'ArrowLeft')).subscribe((e) => {
    const parent = query.parent(get.current);
    if (parent) {
      setCurrent(parent.id);
    }
  });

  return strategy;
};
