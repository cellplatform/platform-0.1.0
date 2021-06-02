import { t } from '../common';

/**
 * Helper for walking a tree of menu item.
 */
export function MenuTree(
  input: t.Menu | t.MenuItem,
  options: { filter?: t.MenuTreeMatch } = {},
): t.MenuTree {
  const baseFilter = options.filter ?? (() => true);

  const visit = (args: { item: t.MenuItem; parent?: t.MenuItem; visitor: t.MenuTreeVisitor }) => {
    const { item, parent, visitor: fn } = args;
    const id = item.id || '';
    let stopped = false;

    if (baseFilter({ id, item, parent })) {
      fn({ id, item, parent, stop: () => (stopped = true) });
    }

    if (!stopped && item.type !== 'separator' && item.submenu) {
      for (const child of item.submenu) {
        if (visit({ visitor: fn, item: child, parent: item }).stopped) break; // <== RECURSION 🌳
      }
    }

    return { stopped };
  };

  const tree: t.MenuTree = {
    walk(visitor) {
      if (Array.isArray(input)) {
        for (const item of input) {
          if (visit({ visitor, item }).stopped) break;
        }
      } else {
        visit({ visitor, item: input });
      }
      return tree;
    },

    filter(fn) {
      const filter: t.MenuTreeMatch = (args) => baseFilter(args) && fn(args);
      return MenuTree(input, { filter });
    },

    find<M extends t.MenuItem = t.MenuItem>(filter: t.MenuTreeMatch) {
      let res: M | undefined;

      tree.walk((e) => {
        const { id, item, parent } = e;
        if (filter({ id, item, parent }) === true) {
          e.stop();
          res = e.item as M;
        }
      });

      return res;
    },
  };

  return tree;
}
