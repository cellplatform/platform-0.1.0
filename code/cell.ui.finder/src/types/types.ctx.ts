import { t } from './common';

/**
 * The context object passed down through a React component hierarchy.
 */
export type IFinderContext = t.IEnvContext<t.AppEvent> & {
  getState(): t.IAppState;
};
