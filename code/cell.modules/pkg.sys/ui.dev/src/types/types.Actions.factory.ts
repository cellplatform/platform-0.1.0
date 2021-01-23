import { t } from './common';

type O = Record<string, unknown>;
type B<Ctx extends O> = t.DevActionModelBuilder<Ctx>;

/**
 * Factory
 */
export type DevActionModelFactory = {
  model<Ctx extends O>(): t.DevActionModelState<Ctx>;
  api<Ctx extends O>(input?: t.DevActionModelState<Ctx> | t.DevActionModel<Ctx>): B<Ctx>;
};
