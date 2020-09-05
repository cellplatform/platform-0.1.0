import { filter, map, takeUntil } from 'rxjs/operators';

import { Module, rx, t } from '../common';
import { IHostPropsRenderer } from '../components/Host';
import { renderer } from '../components/render';

type E = t.HarnessEvent;
type P = t.HarnessProps;
type O = Record<string, unknown>;

const MAIN: t.HarnessRegion = 'Main';
const SIDEBAR: t.HarnessRegion = 'Sidebar';

/**
 * Listens for DevHarness render requests.
 */
export function renderStrategy(args: { harness: t.HarnessModule; bus: t.EventBus<E> }) {
  const { harness, bus } = args;
  const fire = Module.fire(bus);
  const $ = bus.event$.pipe(takeUntil(harness.dispose$));

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
  const renderHarness = (region: t.HarnessRegion, view: t.HarnessView, data?: O) => {
    /**
     * TODO 🐷
     * pass as target after rename top "region"
     */
    const shell = harness.root.props?.data?.shell;

    if (shell) {
      fire.render({
        module: harness.id,
        view,
        region,
        data,
      });
    }
  };

  /**
   * Render "dev" component content.
   */
  const renderContent = (region: t.HarnessRegion, module: string, view: string) => {
    return fire.render({ module, view, region });
  };
  const renderContentNode = (module: string, node: t.ITreeNode<P>) => {
    const view = pluck(node)?.view.component;
    if (view) {
      renderContent(MAIN, module, view);
    }
    (node.children || []).forEach((child) => {
      renderContentNode(module, child); // <== RECURSION 🌳
    });
  };

  /**
   * Listen for Harness render requests.
   */
  const render$ = rx.payload<t.IHarnessRenderEvent>($, 'Harness/render').pipe(
    filter((e) => e.harness === harness.id),
    map(({ module, view, host }) => ({ module, view, host: host as t.IDevHost })),
  );

  /**
   * HANDLE: A host configuration exists. This is a "component under test" rendering.
   */
  render$.pipe(filter((e) => Boolean(e.host))).subscribe((e) => {
    const { host, module } = e;

    if (host.view.component) {
      // Render the root component HOST.
      const view = host.view.component;
      renderHarness(MAIN, 'Host', { view });

      // Render content and any child components.
      const node = harness.find(module)?.query.find((e) => pluck(e.node).view.component === view);
      if (node) {
        renderContentNode(module, node);
      }
    }

    if (host.view.sidebar) {
      const res = renderContent(SIDEBAR, module, host.view.sidebar);
      if (!res) {
        renderHarness(SIDEBAR, 'Null'); // The sidebar did not result in any UI, make sure it is cleared.
      }
    }
  });

  /**
   * HANDLE: No host configuration - this is a "standard" module rendering.
   */
  render$
    .pipe(
      filter((e) => !Boolean(e.host)),
      filter((e) => Boolean(e.view)),
      map(({ module, view }) => ({ module, view: view as string })),
    )
    .subscribe(({ module, view }) => {
      // There is no specific host information on the node,
      // so construct some defaults to pass over to the renderer.
      const margin = 50;
      const data: IHostPropsRenderer = {
        view,
        layout: {
          background: 1,
          cropmarks: false,
          position: { absolute: { top: margin, right: margin, bottom: margin, left: margin } },
        },
      };

      renderHarness(MAIN, 'Host', data);
      const res = renderContent(MAIN, module, view);

      if (!res) {
        // No renderers fulfilled the request, fallback to "Not Found".
        renderHarness(MAIN, '404');
        renderHarness(SIDEBAR, 'Null');
      }
    });
}

/**
 * [Helpers]
 */

/**
 * Pluck data from a node.
 */
function pluck(node?: t.ITreeNode<P>) {
  const host = node?.props?.data?.host;
  const view = host?.view || {};
  return { host, view };
}
