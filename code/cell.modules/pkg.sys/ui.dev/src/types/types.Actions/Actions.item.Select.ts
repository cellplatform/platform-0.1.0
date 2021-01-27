import { t } from '../common';
import { ActionTypes } from 'react-select';

/**
 * INPUT: A button with a toggle switch (boolean).
 */
export type DevActionSelect = t.DevActionSelectProps & {
  id: string;
  kind: 'select';
  handler?: t.DevActionSelectHandler<any>;
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
  items: (t.DevActionSelectItem | string)[];
  current: t.DevActionSelectItem[];
};

export type DevActionSelectItem<V = any> = { label: string; value: V };

export type DevActionSelectChanging = {
  action: t.SelectActionTypes;
  next: t.DevActionSelectItem[];
};
