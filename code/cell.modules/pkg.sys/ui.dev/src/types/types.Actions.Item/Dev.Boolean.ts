import { t } from '../common';

type O = Record<string, unknown>;

/**
 * CONFIGURE Boolean (Switch)
 */
export type ActionBooleanConfig<Ctx extends O> = (args: ActionBooleanConfigArgs<Ctx>) => void;
export type ActionBooleanConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  label(value: string | t.ReactNode): ActionBooleanConfigArgs<Ctx>;
  description(value: string | t.ReactNode): ActionBooleanConfigArgs<Ctx>;
  pipe(...handlers: t.ActionBooleanHandler<Ctx>[]): ActionBooleanConfigArgs<Ctx>;
};

/**
 * INPUT: A Button with a toggle switch (boolean).
 */
export type ActionBoolean = t.ActionBooleanProps & {
  id: string;
  kind: 'boolean';
  handlers: t.ActionBooleanHandler<any>[];
};

/**
 * Editable properties of a [Boolean] button.
 */
export type ActionBooleanProps = {
  label: string | t.ReactNode;
  description?: string | t.ReactNode;
  current?: boolean; // Latest value produced by the handler.
};

export type ActionBooleanChanging = { next: boolean };
