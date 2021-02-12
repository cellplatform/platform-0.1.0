import { t } from '../common';

type O = Record<string, unknown>;

/**
 * INPUT: Simple clickable action.
 */
export type ActionButton = t.ActionButtonProps & {
  id: string;
  kind: 'dev/button';
  handlers: t.ActionButtonHandler<any>[];
  isSpinning?: boolean;
};

/**
 * CONFIGURE Button
 */
export type ActionButtonConfig<Ctx extends O> = (args: ActionButtonConfigArgs<Ctx>) => void;
export type ActionButtonConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  label(value: string | t.ReactNode): ActionButtonConfigArgs<Ctx>;
  description(value: string | t.ReactNode): ActionButtonConfigArgs<Ctx>;
  pipe(...handlers: t.ActionButtonHandler<Ctx>[]): ActionButtonConfigArgs<Ctx>;
};

/**
 * Editable properties of a [Button].
 */
export type ActionButtonProps = {
  label: string | t.ReactNode;
  description?: string | t.ReactNode;
};

/**
 * HANDLER: Simple Button.
 */
export type ActionButtonHandler<C> = (e: t.ActionButtonHandlerArgs<C>) => any | Promise<any>;
export type ActionButtonHandlerArgs<C> = t.ActionHandlerArgs<C> & {
  readonly settings: t.ActionHandlerSettings<
    ActionButtonHandlerArgs<C>,
    ActionHandlerSettingsButtonArgs
  >;
  readonly button: t.ActionButtonProps;
};
export type ActionHandlerSettingsButtonArgs = t.ActionHandlerSettingsArgs & {
  button?: Partial<t.ActionButtonProps>;
};
