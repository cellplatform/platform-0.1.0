import { t } from '../../common';

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
  title(value: string | t.ReactNode): ActionButtonConfigArgs<Ctx>;
  label(value: string | t.ReactNode): ActionButtonConfigArgs<Ctx>;
  description(value: string | t.ReactNode): ActionButtonConfigArgs<Ctx>;
  indent(value: number): ActionButtonConfigArgs<Ctx>;
  pipe(...handlers: t.ActionButtonHandler<Ctx>[]): ActionButtonConfigArgs<Ctx>;
};

/**
 * Editable properties of a [Button].
 */
export type ActionButtonProps = {
  title?: string | t.ReactNode;
  label: string | t.ReactNode;
  description?: string | t.ReactNode;
  indent?: number;
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

/**
 * EVENT: Fires for the simple Button action.
 */
export type IActionButtonEvent = {
  type: 'dev:action/Button';
  payload: IActionButtonPayload;
};
export type IActionButtonPayload = {
  namespace: string;
  item: t.ActionButton;
};
