import { t } from './common';

type E = t.AppEvent;

/**
 * The context object passed down through a React component hierarchy.
 */
export type IAppContext = t.IEnvContext<E> & {
  getState(): t.IAppState;
};
