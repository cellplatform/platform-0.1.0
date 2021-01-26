import { t } from '../common';

/**
 * INPUT: Simple clickable action.
 */
export type DevActionButton = t.DevActionButtonProps & {
  id: string;
  kind: 'button';
  handler?: t.DevActionButtonHandler<any>;
};

/**
 * Editable properties of a [Button].
 */
export type DevActionButtonProps = {
  label: string;
  description?: string;
};
