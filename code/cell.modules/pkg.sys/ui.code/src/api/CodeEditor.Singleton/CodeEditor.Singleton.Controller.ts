import { R, rx, t, log } from '../common';
import { staticPaths } from '../Configure/Configure.paths';
import { CodeEditorEvents } from '../Events';

/**
 * Singleton controller for an environment.
 */
export function CodeEditorSingletonController(input: t.EventBus<any>) {
  const bus = rx.busAsType<t.CodeEditorEvent>(input);
  const global = CodeEditorEvents(bus);

  let _status: t.CodeEditorStatus = {
    ready: false,
    paths: staticPaths(),
    instances: [],
  };

  /**
   * Global Status
   */
  global.status.req$.subscribe((e) => {
    const { tx } = e;
    const info = R.clone(_status);
    bus.fire({
      type: 'sys.ui.code/status.g:res',
      payload: { tx, info },
    });
  });

  /**
   * Instance Status Updates
   */
  global.status.instance.update$.subscribe((e) => {
    const { instance, action } = e;
    const id = instance;

    if (action === 'Lifecycle:Start') {
      _status.instances.push(e.info);
    }

    if (action === 'Lifecycle:End') {
      _status.instances = _status.instances.filter((inst) => inst.id !== id);
    }

    global.status.updated({ instance });
  });

  /**
   * Initialize
   */
  global.init.req$.subscribe((e) => {
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

    global.status.updated({});
  });

  log.info(`[CodeEditorSingletonController] started. ${global.id}`);

  // Finish up.
  return global;
}
