import { t } from './common';

export * from './types.events';

export type FinderDispatch = (e: t.FinderEvent) => void;
export type IFinderContext = t.IEnvContext<t.FinderEvent>;
