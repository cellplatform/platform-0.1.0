import { t } from './common';

/**
 * Item types.
 */
export type DevActionItem = DevActionItemInput | DevActionItemLayout;
export type DevActionItemLayout = DevActionItemHr | DevActionItemTitle;
export type DevActionItemInput = DevActionItemButton | DevActionItemBoolean;

/**
 * Simple clickable action.
 */
export type DevActionItemButton = {
  kind: 'button';
  label: string;
  description?: string;
  handler?: t.DevActionButtonHandler<any>;
};

export type DevActionItemBoolean = {
  kind: 'boolean';
  label: string;
  description?: string;
  handler?: t.DevActionBooleanHandler<any>;
};

/**
 * Horizontal rule (divider).
 */
export type DevActionItemHr = {
  kind: 'hr';
  height: number;
  opacity: number;
  margin: t.DevEdgeSpacing;
};

/**
 * Title text.
 */
export type DevActionItemTitle = {
  kind: 'title';
  text: string;
};
