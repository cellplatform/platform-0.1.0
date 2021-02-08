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
 * INPUT: Simple clickable action.
 */
export type DevActionButton = t.DevActionButtonProps & {
  id: string;
  kind: 'button';
  handlers: t.DevActionButtonHandler<any>[];
};

/**
 * Editable properties of a [Button].
 */
export type DevActionButtonProps = {
  label: string | t.ReactNode;
  description?: string | t.ReactNode;
};
