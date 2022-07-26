import * as t from '../common/types';

/**
 * Common definition of a "default" entry
 */
export type ModuleDefaultEntry = (
  pump: t.EventPump,
  ctx: ModuleDefaultEntryContext,
) => any | Promise<any>;

export type ModuleDefaultEntryContext = { source: ModuleDefaultEntrySource };

export type ModuleDefaultEntrySource = {
  url: t.ManifestUrl;
  namespace: string;
  entry: string;
};
