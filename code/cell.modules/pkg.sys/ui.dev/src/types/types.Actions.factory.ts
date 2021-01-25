import { t } from './common';

type O = Record<string, unknown>;
type B<Ctx extends O> = t.DevActions<Ctx>;

/**
 * Factory
 */
export type DevActionModelFactory = {
  model<Ctx extends O>(): t.DevActionsModelState<Ctx>;
  api<Ctx extends O>(input?: t.DevActionsModelState<Ctx> | t.DevActionsModel<Ctx>): B<Ctx>;
};
