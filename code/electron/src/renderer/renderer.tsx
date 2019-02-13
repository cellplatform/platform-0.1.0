import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DevToolsRenderer } from '../helpers/devTools/renderer';
import { getId, init as initIpc } from '../helpers/ipc/renderer';
import { init as initLog } from '../helpers/logger/renderer';
import { init as initStore } from '../helpers/store/renderer';
import * as t from '../types';
import { Context, createProvider, ReactContext } from './Context';

export { Context, ReactContext };
export * from '../types';

type Refs = {
  renderer?: t.IRenderer;
  devTools: DevToolsRenderer;
};
const refs: Refs = { devTools: new DevToolsRenderer() };

/**
 * Initializes [Renderer] process systems (safely).
 */
export async function init<
  M extends t.IpcMessage = any,
  S extends t.StoreJson = any
>(): Promise<t.IRenderer<M, S>> {
  if (refs.renderer) {
    return refs.renderer;
  }

  // Ipc.
  const ipc = initIpc<M>();

  // Log.
  const log = initLog({ ipc });

  // Store.
  const store = initStore<S>({ ipc });

  // Dev tools.
  refs.devTools.init({ ipc });

  // Retrieve the ID.
  const id = await getId();

  // React <Provider>.
  const context: t.IContext = { id, ipc, store, log };
  const Provider = createProvider(context);

  // Finish up.
  refs.renderer = { ...context, Context, Provider };
  return refs.renderer;
}

/**
 * Renders the root of the application into the DOM within
 * an initialized <Provider>.
 *
 * To kick off the app:
 *
 *      import renderer from '@platform/electron/lib/renderer';
 *
 *      renderer
 *        .render(el, 'root')
 *        .then(context => {
 *          console.log('renderer loaded:', context);
 *        })
 *        .catch(err => {
 *          // Do something with the error.
 *        });
 *
 * To access the context deep within the React tree add a `contextType`:
 *
 *      export class MyView extends React.PureComponent {
 *        public public static contextType = renderer.Context;
 *        public public context!: renderer.ReactContext
 *        public render() {
 *          return <div>window-id: {this.context.id}<div>;
 *        }
 *      }
 *
 */
export async function render(
  element: React.ReactElement<any>,
  container: Element | string,
) {
  // Setup initial conditions.
  const renderer = await init();
  const { log, Provider } = renderer;

  const throwError = (msg: string) => {
    log.error(msg);
    throw new Error(msg);
  };

  // Find the container element to render within.
  const elContainer =
    typeof container === 'object'
      ? container
      : document.getElementById(container || 'root');

  if (!elContainer) {
    const msg = `RENDERER START: Could not find the given Element container '${container}' to load the app within.`;
    throwError(msg);
  }

  // Render into the DOM.
  try {
    const el = <Provider>{element}</Provider>;
    ReactDOM.render(el, elContainer);
  } catch (error) {
    const msg = `RENDERER START: Failed while rendering DOM. ${error.message}`;
    throwError(msg);
  }

  // Finish up.
  return renderer;
}
