import { t } from './common';

/**
 * Item types.
 */
export type ActionItem = ActionItemInput | ActionItemLayout;
export type ActionItemLayout = ActionItemHr | ActionItemTitle;
export type ActionItemInput = ActionItemButton;

/**
 * Simple clickable action.
 */
export type ActionItemButton = {
  type: 'button';
  label: string;
  description?: string;
  onClick?: t.ActionHandler<any>;
};

/**
 * Horizontal rule (divider).
 */
export type ActionItemHr = {
  type: 'hr';
  height: number;
  opacity: number;
  margin: t.DevEdgeSpacing;
};

/**
 * Title text.
 */
export type ActionItemTitle = {
  type: 'title';
  text: string;
};
