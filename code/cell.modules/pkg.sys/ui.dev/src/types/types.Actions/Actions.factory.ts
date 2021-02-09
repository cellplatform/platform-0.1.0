import { t } from '../common';

type O = Record<string, unknown>;
type B<Ctx extends O> = t.Actions<Ctx>;

/**
 * Factory
 */
export type ActionModelFactory = {
  model<Ctx extends O>(): t.ActionsModelState<Ctx>;
  api<Ctx extends O>(input?: t.ActionsModelState<Ctx> | t.ActionsModel<Ctx>): B<Ctx>;
};
