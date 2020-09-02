import { filter, map, takeUntil } from 'rxjs/operators';

import { Module, rx, t } from '../common';
import { renderer } from '../components/render';
import { IHostPropsRenderer } from '../components/Host';

type E = t.HarnessEvent;
type P = t.HarnessProps;

/**
 * Listens for DevHarness render requests.
 */
export function renderStrategy(args: { harness: t.HarnessModule; bus: t.EventBus<E> }) {
  const { harness, bus } = args;
  const fire = Module.fire(bus);
  const $ = bus.event$.pipe(takeUntil(harness.dispose$));
  const currentHost = () => harness.root.props?.data?.host as t.IDevHost;

  /**
   * Setup the UI <component> renderer.
   */
  const match: t.ModuleFilterEvent = (e) => e.module == harness.id;
  const events = Module.events<P>(Module.filter(bus.event$, match), harness.dispose$);
  renderer({ harness, bus, events });

  /**
   * Render a harness component
   * (as opposed to content from within a "dev" module using the harness).
   */
  const renderHarness = (
    target: t.HarnessTarget,
    view: t.HarnessView,
    data?: Record<string, unknown>,
  ) => {
    const module = harness.id;
    fire.render({ module, view, target, data });
  };

  /**
   * Listen for Harness render requests.
   */
  const harnessRender$ = rx.payload<t.IHarnessRenderEvent>($, 'Harness/render').pipe(
    filter((e) => e.harness === harness.id),
    map(({ module, view }) => ({ module, view, host: currentHost() })),
  );

  const MAIN: t.HarnessTarget = 'Main';
  const SIDEBAR: t.HarnessTarget = 'Sidebar';

  const getHost = (node?: t.ITreeNode<P>) => node?.props?.data?.host;

  /**
   * HANDLE: A host configuration exists. - this is a "component under test" rendering.
   */
  harnessRender$.pipe(filter((e) => Boolean(e.host))).subscribe((e) => {
    const { host, module } = e;

    if (host.view.component) {
      // Render the root component HOST.
      const view = host.view.component;
      renderHarness(MAIN, 'Host', { view });
      fire.render({ module, view, target: MAIN });

      // Check for any child components and render those also within their HOST containers also.
      const node = harness
        .find(module)
        ?.query.find((e) => getHost(e.node)?.view.component === view);

      /**
       * TODO 🐷
       * - recurively look for and render the children
       * - treeview (strategy): keyboard not stepping down into 3rd level inline child.
       */

      if (node && node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          const view = getHost(child)?.view.component;
          if (view) {
            fire.render({ module, view, target: MAIN });
          }
        });
      }
    }

    if (host.view.sidebar) {
      const view = host.view.sidebar;
      const res = fire.render({ module, view, target: SIDEBAR });
      if (!res) {
        renderHarness(SIDEBAR, 'Null'); // The sidebar did not result in any UI, make sure it is cleared.
      }
    }
  });

  /**
   * HANDLE: No host configuration - this is a "standard" module rendering.
   */
  harnessRender$.pipe(filter((e) => !Boolean(e.host))).subscribe(({ module, view }) => {
    if (view) {
      // There is not specific host information to construct some defaults to pass to the renderer.
      const edge = 50;
      const data: IHostPropsRenderer = {
        view,
        layout: {
          background: 1,
          cropmarks: false,
          position: { absolute: { top: edge, right: edge, bottom: edge, left: edge } },
        },
      };

      renderHarness(MAIN, 'Host', data);

      const res = fire.render({ module, view, target: MAIN });
      if (!res) {
        renderHarness(MAIN, '404');
        renderHarness(SIDEBAR, 'Null');
      }
    }
  });
}
