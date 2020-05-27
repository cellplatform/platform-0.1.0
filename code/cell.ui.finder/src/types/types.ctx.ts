import { t } from './common';

export type IFinderContext = t.IEnvContext<t.FinderEvent> & {
  toState(): t.IFinderState;
  dispatch(e: t.FinderEvent): void;
};
