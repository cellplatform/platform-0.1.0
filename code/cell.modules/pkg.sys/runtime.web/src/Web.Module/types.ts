import * as t from '../common/types';

/**
 * Common definition of a "default" entry
 */
export type ModuleDefaultEntry = (bus: t.EventBus<any>, ctx: ModuleDefaultEntryContext) => any;
export type ModuleDefaultEntryContext = {
  source: ModuleDefaultEntrySource;
};

export type ModuleDefaultEntrySource = {
  url: t.ManifestUrl;
  namespace: string;
  entry: string;
};
