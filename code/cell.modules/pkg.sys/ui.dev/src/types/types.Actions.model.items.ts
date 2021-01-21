import { t } from './common';

/**
 * Item types.
 */
export type DevActionItem = DevActionItemInput | DevActionItemLayout;
export type DevActionItemLayout = DevActionItemHr | DevActionItemTitle;
export type DevActionItemInput = DevActionItemButton;

/**
 * Simple clickable action.
 */
export type DevActionItemButton = {
  type: 'button';
  label: string;
  description?: string;
  onClick?: t.DevActionHandler<any>;
};

/**
 * Horizontal rule (divider).
 */
export type DevActionItemHr = {
  type: 'hr';
  height: number;
  opacity: number;
  margin: t.DevEdgeSpacing;
};

/**
 * Title text.
 */
export type DevActionItemTitle = {
  type: 'title';
  text: string;
};
