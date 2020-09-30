import { t } from '../common';

/**
 * Static UI builder methods
 */
export type ViewBuilder = {
  create: t.Builder['create'];
  tree: t.ViewBuilderTree;
};
