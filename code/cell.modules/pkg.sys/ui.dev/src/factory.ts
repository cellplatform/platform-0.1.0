import { t } from './common';
import { ActionsFactory } from './api/Actions';
import { DevDefs, DisplayDefs } from './defs';

type O = Record<string, unknown>;

/**
 * An [Actions] builder configured with the base
 * set of action-defs for rapidly constructing
 * and testing components.
 */
export function DevActions<Ctx extends O>() {
  type M = t.DevMethods<Ctx> & t.DisplayMethods<Ctx>;
  const defs = [...DevDefs, ...DisplayDefs];
  return ActionsFactory.compose<Ctx, M>(defs);
}
