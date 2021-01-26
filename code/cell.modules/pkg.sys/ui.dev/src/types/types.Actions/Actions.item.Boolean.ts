import { t } from '../common';

/**
 * INPUT: A Button with a toggle switch (boolean).
 */
export type DevActionBoolean = t.DevActionBooleanProps & {
  id: string;
  kind: 'boolean';
  current?: boolean; // Latest value produced by the handler.
  handler?: t.DevActionBooleanHandler<any>;
};

/**
 * Editable properties of a [Boolean] button.
 */
export type DevActionBooleanProps = {
  label: string;
  description?: string;
};
