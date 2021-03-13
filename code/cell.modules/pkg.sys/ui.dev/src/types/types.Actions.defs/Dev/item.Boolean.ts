import { t } from '../../common';

type O = Record<string, unknown>;

/**
 * INPUT: A Button with a toggle switch (boolean).
 */
export type ActionBoolean = t.ActionBooleanProps & {
  id: string;
  kind: 'dev/boolean';
  handlers: t.ActionBooleanHandler<any>[];
  isSpinning?: boolean;
};

/**
 * CONFIGURE Boolean (Switch)
 */
export type ActionBooleanConfig<Ctx extends O> = (args: ActionBooleanConfigArgs<Ctx>) => void;
export type ActionBooleanConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  title(value: string | t.ReactNode): ActionBooleanConfigArgs<Ctx>;
  label(value: string | t.ReactNode): ActionBooleanConfigArgs<Ctx>;
  description(value: string | t.ReactNode): ActionBooleanConfigArgs<Ctx>;
  pipe(...handlers: t.ActionBooleanHandler<Ctx>[]): ActionBooleanConfigArgs<Ctx>;
};

/**
 * Editable properties of a [Boolean] button.
 */
export type ActionBooleanProps = {
  title?: string | t.ReactNode;
  label: string | t.ReactNode;
  description?: string | t.ReactNode;
  current?: boolean; // Latest value produced by the handler.
};

export type ActionBooleanChanging = { next: boolean };

/**
 * HANDLER Boolean (switch)
 */
export type ActionBooleanHandler<C> = (e: t.ActionBooleanHandlerArgs<C>) => any | Promise<any>;
export type ActionBooleanHandlerArgs<C> = t.ActionHandlerArgs<C> & {
  readonly settings: t.ActionHandlerSettings<
    ActionBooleanHandlerArgs<C>,
    ActionHandlerSettingsBooleanArgs
  >;
  readonly boolean: t.ActionBooleanProps;
  readonly changing?: t.ActionBooleanChanging; // Exists when an interaction has causes the state to change.
};
export type ActionHandlerSettingsBooleanArgs = t.ActionHandlerSettingsArgs & {
  boolean?: Partial<t.ActionBooleanProps>;
};

/**
 * EVENT: Fires for the Boolean (switch) action.
 */
export type IActionBooleanEvent = {
  type: 'dev:action/Boolean';
  payload: IActionBooleanPayload;
};
export type IActionBooleanPayload = {
  namespace: string;
  item: t.ActionBoolean;
  changing?: t.ActionBooleanChanging;
};
