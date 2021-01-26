import { t } from './common';

/**
 * Item types.
 */
export type DevActionItem = DevActionItemInput | DevActionItemContent;
export type DevActionItemContent = DevActionItemHr | DevActionItemTitle;
export type DevActionItemInput = DevActionItemButton | DevActionItemBoolean;

/**
 * INPUT: Simple clickable action.
 */
export type DevActionItemButton = {
  id: string;
  kind: 'button';
  label: string;
  description?: string;
  handler?: t.DevActionButtonHandler<any>;
};

/**
 * INPUT: A button with a toggle switch (boolean)
 */
export type DevActionItemBoolean = {
  id: string;
  kind: 'boolean';
  label: string;
  description?: string;
  current?: boolean; // Latest value produced by the handler.
  handler?: t.DevActionBooleanHandler<any>;
};

/**
 * CONTENT: Horizontal rule (divider).
 */
export type DevActionItemHr = {
  id: string;
  kind: 'hr';
  height: number;
  opacity: number;
  margin: t.DevEdgeSpacing;
};

/**
 * CONTENT: Title text.
 */
export type DevActionItemTitle = {
  id: string;
  kind: 'title';
  text: string;
};
