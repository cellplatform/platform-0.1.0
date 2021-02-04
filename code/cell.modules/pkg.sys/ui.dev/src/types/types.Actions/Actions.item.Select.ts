import { t } from '../common';

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
