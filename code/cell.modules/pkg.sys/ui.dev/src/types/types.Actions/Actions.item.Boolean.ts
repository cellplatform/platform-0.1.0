import { t } from '../common';

/**
 * INPUT: A Button with a toggle switch (boolean).
 */
export type DevActionBoolean = t.DevActionBooleanProps & {
  id: string;
  kind: 'boolean';
  handler?: t.DevActionBooleanHandler<any>;
};

/**
 * Editable properties of a [Boolean] button.
 */
export type DevActionBooleanProps = {
  label: string;
  description?: string;
  current?: boolean; // Latest value produced by the handler.
};

export type DevActionBooleanChanging = { next: boolean };
