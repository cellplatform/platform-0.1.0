import { t } from '../common';

type O = Record<string, unknown>;

/**
 * Button
 */
export type DevActionButtonConfig<Ctx extends O> = (args: DevActionButtonConfigArgs<Ctx>) => void;
export type DevActionButtonConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  label(value: string | t.ReactNode): DevActionButtonConfigArgs<Ctx>;
  description(value: string | t.ReactNode): DevActionButtonConfigArgs<Ctx>;
  pipe(...handlers: t.DevActionButtonHandler<Ctx>[]): DevActionButtonConfigArgs<Ctx>;
};

/**
 * Boolean (Switch)
 */
export type DevActionBooleanConfig<Ctx extends O> = (args: DevActionBooleanConfigArgs<Ctx>) => void;
export type DevActionBooleanConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  label(value: string | t.ReactNode): DevActionBooleanConfigArgs<Ctx>;
  description(value: string | t.ReactNode): DevActionBooleanConfigArgs<Ctx>;
  handler(handler: t.DevActionBooleanHandler<Ctx>): DevActionBooleanConfigArgs<Ctx>;
};

/**
 * Select (Dropdown)
 */
export type DevActionSelectConfig<Ctx extends O> = (args: DevActionSelectConfigArgs<Ctx>) => void;
export type DevActionSelectConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  label(value: string | t.ReactNode): DevActionSelectConfigArgs<Ctx>;
  description(value: string | t.ReactNode): DevActionSelectConfigArgs<Ctx>;
  items(list: t.DevActionSelectItemInput[]): DevActionSelectConfigArgs<Ctx>;
  initial(
    value?: t.DevActionSelectItemInput | t.DevActionSelectItemInput[],
  ): DevActionSelectConfigArgs<Ctx>;
  multi(value: boolean): DevActionSelectConfigArgs<Ctx>;
  clearable(value: boolean): DevActionSelectConfigArgs<Ctx>;
  handler(handler: t.DevActionSelectHandler<Ctx>): DevActionSelectConfigArgs<Ctx>;
};

/**
 * Hr (Horizontal Rule)
 */
export type DevActionHrConfig<Ctx extends O> = (args: DevActionHrConfigArgs<Ctx>) => void;
export type DevActionHrConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  height(value: number): DevActionHrConfigArgs<Ctx>;
  opacity(value: number): DevActionHrConfigArgs<Ctx>;
  margin(value: t.DevEdgeSpacing): DevActionHrConfigArgs<Ctx>;
};

/**
 * Title
 */
export type DevActionTitleConfig<Ctx extends O> = (args: DevActionTitleConfigArgs<Ctx>) => void;
export type DevActionTitleConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  text(value: string): DevActionTitleConfigArgs<Ctx>;
};
