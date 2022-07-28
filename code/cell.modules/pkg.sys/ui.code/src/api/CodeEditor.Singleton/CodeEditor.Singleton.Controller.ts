import { R, rx, t, log } from '../common';
import { staticPaths } from '../Configure/Configure.paths';
import { CodeEditorEvents } from '../Events';

/**
 * Singleton controller for an environment.
 */
export function CodeEditorSingletonController(input: t.EventBus<any>) {
  const bus = rx.busAsType<t.CodeEditorEvent>(input);
  const events = CodeEditorEvents(bus);

  let _status: t.CodeEditorStatus = {
    ready: false,
    paths: staticPaths(),
  };

  /**
   * Status
   */
  events.status.req$.subscribe((e) => {
    const { tx } = e;
    const info = R.clone(_status);
    bus.fire({
      type: 'sys.ui.code/status:res',
      payload: { tx, info },
    });
  });

  /**
   * Initialize
   */
  events.init.req$.subscribe((e) => {
    const { tx } = e;
    _status = {
      ..._status,
      ready: true,
      paths: staticPaths(e.staticRoot),
    };
    bus.fire({
      type: 'sys.ui.code/init:res',
      payload: { tx, info: R.clone(_status) },
    });
  });

  log.info(`[CodeEditorSingletonController] started. ${events.id}`);

  // Finish up.
  return events;
}
