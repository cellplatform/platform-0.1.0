import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DevToolsRenderer } from '../helpers/devTools/renderer';
import { getId, init as initIpc } from '../helpers/ipc/renderer';
import { init as initLog } from '../helpers/logger/renderer';
import { init as initStore } from '../helpers/store/renderer';
import { createProvider, Context, ReactContext } from './Context';
import * as t from '../types';

export { Context, ReactContext };
export * from '../types';

export type IRenderer<
  M extends t.IpcMessage = any,
  S extends t.StoreJson = any
> = t.IContext & {
  Context: React.Context<t.IContext>;
  Provider: React.FunctionComponent;
};

type Refs = {
  renderer?: IRenderer;
  devTools: DevToolsRenderer;
};
const refs: Refs = { devTools: new DevToolsRenderer() };

/**
 * Initializes [Renderer] process systems (safely).
 */
export async function init<
  M extends t.IpcMessage = any,
  S extends t.StoreJson = any
>(): Promise<IRenderer<M, S>> {
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
 */
export async function render(
  el: React.ReactElement<any>,
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
    ReactDOM.render(<Provider>{el}</Provider>, elContainer);
  } catch (error) {
    const msg = `RENDERER START: Failed while rendering DOM. ${error.message}`;
    throwError(msg);
  }

  // Finish up.
  return renderer;
}
