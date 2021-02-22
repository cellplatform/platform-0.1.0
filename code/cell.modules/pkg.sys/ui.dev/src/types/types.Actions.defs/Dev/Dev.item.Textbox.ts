import { t } from '../../common';

type O = Record<string, unknown>;

/**
 * INPUT: Simple <TextInput> action.
 */
export type ActionTextbox = ActionTextboxProps & {
  id: string;
  kind: 'dev/textbox';
  handlers: ActionTextboxHandler<any>[];
  isSpinning?: boolean;
};

/**
 * CONFIGURE Textbox
 */
export type ActionTextboxConfig<Ctx extends O> = (args: ActionTextboxConfigArgs<Ctx>) => void;
export type ActionTextboxConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  label(value: string | t.ReactNode): ActionTextboxConfigArgs<Ctx>;
  description(value: string | t.ReactNode): ActionTextboxConfigArgs<Ctx>;
  pipe(...handlers: ActionTextboxHandler<Ctx>[]): ActionTextboxConfigArgs<Ctx>;
};

/**
 * Editable properties of a [Textbox].
 */
export type ActionTextboxProps = {
  label: string | t.ReactNode;
  description?: string | t.ReactNode;
  current?: string; // Latest value produced by the handler.
};

export type ActionTextboxChanging = { next: string };

/**
 * HANDLER: Simple Textbox.
 */
export type ActionTextboxHandler<C> = (e: ActionTextboxHandlerArgs<C>) => any | Promise<any>;
export type ActionTextboxHandlerArgs<C> = t.ActionHandlerArgs<C> & {
  readonly settings: t.ActionHandlerSettings<
    ActionTextboxHandlerArgs<C>,
    ActionHandlerSettingsTextboxArgs
  >;
  readonly textbox: ActionTextboxProps;
  readonly changing?: t.ActionTextboxChanging; // Exists when an interaction has causes the state to change.
};
export type ActionHandlerSettingsTextboxArgs = t.ActionHandlerSettingsArgs & {
  textbox?: Partial<ActionTextboxProps>;
};
