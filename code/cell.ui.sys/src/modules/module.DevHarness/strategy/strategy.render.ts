import { filter, map, takeUntil } from 'rxjs/operators';

import { Module, rx, t } from '../common';
import { renderer } from '../components/render';

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
  const renderHarness = (view: t.HarnessView, target?: t.HarnessTarget) => {
    const module = harness.id;
    fire.render({ module, view, target });
  };

  /**
   * Listen for Harness render requests.
   */
  const harnessRender$ = rx.payload<t.IHarnessRenderEvent>($, 'Harness/render').pipe(
    filter((e) => e.harness === harness.id),
    map(({ module, view }) => ({ module, view, host: currentHost() })),
  );

  /**
   * HANDLE: A host configuration exists. - this is a "component under test" rendering.
   */
  const MAIN: t.HarnessTarget = 'Main';
  const SIDEBAR: t.HarnessTarget = 'Sidebar';

  harnessRender$.pipe(filter((e) => Boolean(e.host))).subscribe(({ host, module }) => {
    renderHarness('Host/component', MAIN);

    const view = host.view;

    if (view.component) {
      fire.render({ module, view: view.component, target: MAIN });
    }

    if (view.sidebar) {
      const res = fire.render({ module, view: view.sidebar, target: SIDEBAR });
      if (!res) {
        renderHarness('Null', SIDEBAR); // The sidebar did not result in any UI, make sure it is cleared.
      }
    }
  });

  /**
   * HANDLE: No host configuration - this is a "standard" module rendering.
   */
  harnessRender$.pipe(filter((e) => !Boolean(e.host))).subscribe(({ module, view }) => {
    /**
     * TODO 🐷
     * - Render this witin a specific layout of "Host/component"
     */

    renderHarness('Host/module/TMP', MAIN);
    const res = fire.render({ module, view });
    if (!res) {
      renderHarness('404', MAIN);
      renderHarness('Null', SIDEBAR);
    }
  });
}
