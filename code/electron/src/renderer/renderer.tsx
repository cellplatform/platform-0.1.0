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

type Refs = {
  ipc?: t.IpcClient;
  store?: t.IStoreClient;
  log?: t.ILog;
  devTools: DevToolsRenderer;
};
const refs: Refs = { devTools: new DevToolsRenderer() };

/**
 * Initializes [Renderer] process systems (safely).
 */
export async function init<
  M extends t.IpcMessage = any,
  S extends t.StoreJson = any
>() {
  // Ipc.
  const ipc = initIpc<M>();
  refs.ipc = ipc;

  // Log.
  const log = initLog({ ipc });

  // Store.
  const store = initStore<S>({ ipc });
  refs.store = store;

  // Dev tools.
  refs.devTools.init({ ipc });

  // Retrieve the ID.
  const id = await getId();

  // React <Provider>.
  const context: t.IContext = { id, ipc, store, log };
  // const Context = createContext(context);
  const Provider = createProvider(context);

  // Finish up.
  return { ...context, Context, Provider, render };
}

/**
 * Renders the root of the application into the DOM within
 * an initialized <Provider>.
 */
export async function render(
  el: React.ReactElement<any>,
  container: Element | string,
) {
  const renderer = await init();
  const { log, Provider } = renderer;

  const elContainer =
    typeof container === 'object'
      ? container
      : document.getElementById(container || 'root');

  if (!elContainer) {
    const msg = `RENDERER START: Could not find the given Element container '${container}' to load the app within.`;
    log.error(msg);
    throw new Error(msg);
  }

  try {
    ReactDOM.render(<Provider>{el}</Provider>, elContainer);
  } catch (error) {
    const msg = `RENDERER START: Failed while rendering DOM. ${error.message}`;
    log.error(msg);
    throw new Error(msg);
  }
}
