import { t } from './common';

export type IFinderContext = t.IEnvContext<t.FinderEvent> & {
  getState(): t.IFinderState;
  dispatch(e: t.FinderEvent): void;
};
