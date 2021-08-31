import { slug, t, time, Patch } from '../common';
import { MenuTree } from '../util';

export function PatchController(args: { bus: t.EventBus<t.MenuEvent>; events: t.MenuEvents }) {
  const { bus, events } = args;

  events.patch.req$.subscribe(async (e) => {
    const timer = time.timer();
    const { tx = slug(), id, timeout, patches } = e;

    const done = (args: { menu?: t.Menu; error?: string } = {}) => {
      const { error, menu = [] } = args;
      const elapsed = timer.elapsed.msec;
      bus.fire({
        type: 'runtime.electron/Menu/patch:res',
        payload: { tx, id, menu, error, elapsed },
      });
    };
    const fail = (error: string) => done({ error });

    try {
      // Retrieve the sub-menu item to operate on.
      const root = (await events.status.get()).menu;

      // Walk the tree and find the node to apply the changes to.
      let error = '';
      MenuTree(root).walk((e) => {
        if (e.id !== id) return;

        const replace = (within: t.Menu) => {
          const index = within.findIndex((m) => m.id === id);
          if (index < 0) {
            e.stop();
            error = `Failed to apply change within menu '${id}'. Replacement index not found.`;
            return;
          }
          within[index] = Patch.apply(e.item, patches);
        };

        if (!e.parent) {
          replace(root);
        }
        if (e.parent) {
          const submenu = (e.parent as t.MenuItemNormal).submenu || [];
          replace(submenu);
        }
      });

      if (error) {
        return fail(error);
      }

      // Reload the menu with the newly patches changes.
      const res = await events.load.fire(root, { timeout });
      return res.error ? fail(res.error) : done({ menu: res.menu });
    } catch (err: any) {
      fail(`Failed patching menu '${id}'. ${err.message}`); // Failure.
    }
  });
}
