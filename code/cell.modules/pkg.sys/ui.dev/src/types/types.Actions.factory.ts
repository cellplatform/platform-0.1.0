import { t } from './common';

type B<Ctx> = t.ActionModelBuilder<Ctx>;

/**
 * Factory
 */
export type ActionModelFactory = {
  model<Ctx>(): t.ActionModelState<Ctx>;
  builder<Ctx>(input?: t.ActionModelState<Ctx> | t.ActionModel<Ctx>): B<Ctx>;
};
