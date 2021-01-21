import { t } from './common';

type B<Ctx> = t.DevActionModelBuilder<Ctx>;

/**
 * Factory
 */
export type DevActionModelFactory = {
  model<Ctx>(): t.DevActionModelState<Ctx>;
  builder<Ctx>(input?: t.DevActionModelState<Ctx> | t.DevActionModel<Ctx>): B<Ctx>;
};
