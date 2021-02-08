import { t } from '../common';

type O = Record<string, unknown>;

/**
 * Boolean (Switch)
 */
export type DevActionBooleanConfig<Ctx extends O> = (args: DevActionBooleanConfigArgs<Ctx>) => void;
export type DevActionBooleanConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  label(value: string | t.ReactNode): DevActionBooleanConfigArgs<Ctx>;
  description(value: string | t.ReactNode): DevActionBooleanConfigArgs<Ctx>;
  pipe(...handlers: t.DevActionBooleanHandler<Ctx>[]): DevActionBooleanConfigArgs<Ctx>;
};

/**
 * INPUT: A Button with a toggle switch (boolean).
 */
export type DevActionBoolean = t.DevActionBooleanProps & {
  id: string;
  kind: 'boolean';
  handlers: t.DevActionBooleanHandler<any>[];
};

/**
 * Editable properties of a [Boolean] button.
 */
export type DevActionBooleanProps = {
  label: string | t.ReactNode;
  description?: string | t.ReactNode;
  current?: boolean; // Latest value produced by the handler.
};

export type DevActionBooleanChanging = { next: boolean };
