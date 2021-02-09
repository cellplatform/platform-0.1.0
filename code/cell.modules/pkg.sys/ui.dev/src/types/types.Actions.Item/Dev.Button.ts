import { t } from '../common';

type O = Record<string, unknown>;

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
 * INPUT: Simple clickable action.
 */
export type ActionButton = t.ActionButtonProps & {
  id: string;
  kind: 'button';
  handlers: t.ActionButtonHandler<any>[];
};

/**
 * Editable properties of a [Button].
 */
export type ActionButtonProps = {
  label: string | t.ReactNode;
  description?: string | t.ReactNode;
};
