import { t } from '../common';

type O = Record<string, unknown>;

/**
 * INPUT: A button with a toggle switch (boolean).
 */
export type ActionSelect = t.ActionSelectProps & {
  id: string;
  kind: 'select';
  handlers: t.ActionSelectHandler<any>[];
};


/**
 * CONFIGURE Select (Dropdown)
 */
export type ActionSelectConfig<Ctx extends O> = (args: ActionSelectConfigArgs<Ctx>) => void;
export type ActionSelectConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  label(value: string | t.ReactNode): ActionSelectConfigArgs<Ctx>;
  description(value: string | t.ReactNode): ActionSelectConfigArgs<Ctx>;
  items(list: t.ActionSelectItemInput[]): ActionSelectConfigArgs<Ctx>;
  initial(value?: t.ActionSelectItemInput | t.ActionSelectItemInput[]): ActionSelectConfigArgs<Ctx>;
  multi(value: boolean): ActionSelectConfigArgs<Ctx>;
  clearable(value: boolean): ActionSelectConfigArgs<Ctx>;
  pipe(...handlers: t.ActionSelectHandler<Ctx>[]): ActionSelectConfigArgs<Ctx>;
};


/**
 * Editable properties of a [Select] input.
 */
export type ActionSelectProps = {
  label: string | t.ReactNode;
  description?: string | t.ReactNode;
  placeholder?: boolean;
  multi: boolean;
  clearable: boolean;
  items: t.ActionSelectItemInput[];
  initial?: t.ActionSelectItemInput | t.ActionSelectItemInput[];
  current: t.ActionSelectItem[];
};

export type ActionSelectItem<V = any> = { label: string; value: V };
export type ActionSelectItemInput = string | number | boolean | t.ActionSelectItem;

export type ActionSelectChanging = {
  action: t.SelectActionTypes;
  next: t.ActionSelectItem[];
};

/**
 * HANDLER Select (dropdown)
 */
export type ActionSelectHandler<C> = (e: t.ActionSelectHandlerArgs<C>) => void;
export type ActionSelectHandlerArgs<C> = t.ActionHandlerArgs<C> & {
  readonly settings: t.ActionHandlerSettings<
    ActionSelectHandlerArgs<C>,
    ActionHandlerSettingsSelectArgs
  >;
  readonly select: t.ActionSelectProps;
  readonly changing?: t.ActionSelectChanging; // Exists when an interaction has causes the state to change.
};
export type ActionHandlerSettingsSelectArgs = t.ActionHandlerSettingsArgs & {
  select?: Partial<t.ActionSelectProps>;
};
