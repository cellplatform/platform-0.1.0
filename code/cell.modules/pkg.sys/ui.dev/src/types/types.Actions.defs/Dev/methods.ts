import { t } from '../../common';

type O = Record<string, unknown>;

/**
 * Methods for "dev" (development) tp rapidly build and test component- states.
 */
export type DevMethods<Ctx extends O> = {
  button(label: string, handler?: t.ActionButtonHandler<Ctx>): DevMethods<Ctx>;
  button(config: t.ActionButtonConfig<Ctx>): DevMethods<Ctx>;

  boolean(label: string, handler?: t.ActionBooleanHandler<Ctx>): t.Actions<Ctx>;
  boolean(config: t.ActionBooleanConfig<Ctx>): t.Actions<Ctx>;

  textbox(label: string, handler?: t.ActionTextboxHandler<Ctx>): t.Actions<Ctx>;
  textbox(config: t.ActionTextboxConfig<Ctx>): t.Actions<Ctx>;

  select(config: t.ActionSelectConfig<Ctx>): t.Actions<Ctx>;
};
