import { t } from '../common';

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
