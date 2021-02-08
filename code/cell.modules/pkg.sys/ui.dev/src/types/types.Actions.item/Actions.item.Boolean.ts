import { t } from '../common';

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
