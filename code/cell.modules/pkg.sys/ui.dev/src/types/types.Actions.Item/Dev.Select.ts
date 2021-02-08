import { t } from '../common';

type O = Record<string, unknown>;

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
  pipe(...handlers: t.DevActionSelectHandler<Ctx>[]): DevActionSelectConfigArgs<Ctx>;
};

/**
 * INPUT: A button with a toggle switch (boolean).
 */
export type DevActionSelect = t.DevActionSelectProps & {
  id: string;
  kind: 'select';
  handlers: t.DevActionSelectHandler<any>[];
};

/**
 * Editable properties of a [Select] input.
 */
export type DevActionSelectProps = {
  label: string | t.ReactNode;
  description?: string | t.ReactNode;
  placeholder?: boolean;
  multi: boolean;
  clearable: boolean;
  items: t.DevActionSelectItemInput[];
  initial?: t.DevActionSelectItemInput | t.DevActionSelectItemInput[];
  current: t.DevActionSelectItem[];
};

export type DevActionSelectItem<V = any> = { label: string; value: V };
export type DevActionSelectItemInput = string | number | boolean | t.DevActionSelectItem;

export type DevActionSelectChanging = {
  action: t.SelectActionTypes;
  next: t.DevActionSelectItem[];
};
