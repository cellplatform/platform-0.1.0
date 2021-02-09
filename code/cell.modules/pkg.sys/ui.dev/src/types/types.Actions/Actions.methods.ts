import { t } from '../common';

type O = Record<string, unknown>;

/**
 * Methods for basic display markup such as titles.
 */
export type DisplayMethods<Ctx extends O> = {
  hr(height?: number, opacity?: number, margin?: t.EdgeSpacing): DisplayMethods<Ctx>;
  hr(config?: t.ActionHrConfig<Ctx>): DisplayMethods<Ctx>;
  title(text: string, config?: t.ActionTitleConfig<Ctx>): t.Actions<Ctx>;
  title(config: t.ActionTitleConfig<Ctx>): t.Actions<Ctx>;
};

/**
 * Methods for "dev" (development) tp rapidly build and test component- states.
 */
export type DevMethods<Ctx extends O> = {
  button(label: string, handler?: t.ActionButtonHandler<Ctx>): DevMethods<Ctx>;
  button(config: t.ActionButtonConfig<Ctx>): DevMethods<Ctx>;

  boolean(label: string, handler?: t.ActionBooleanHandler<Ctx>): t.Actions<Ctx>;
  boolean(config: t.ActionBooleanConfig<Ctx>): t.Actions<Ctx>;

  select(config: t.ActionSelectConfig<Ctx>): t.Actions<Ctx>;
};
