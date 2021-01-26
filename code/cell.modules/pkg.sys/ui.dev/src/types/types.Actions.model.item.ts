import { t } from './common';

/**
 * Item types.
 */
export type DevActionItem = DevActionItemInput | DevActionItemContent;
export type DevActionItemContent = DevActionHr | DevActionTitle;
export type DevActionItemInput = DevActionButton | DevActionBoolean | t.DevActionSelect;

/**
 * CONTENT: Horizontal rule (divider).
 */
export type DevActionHr = {
  id: string;
  kind: 'hr';
  height: number;
  opacity: number;
  margin: t.DevEdgeSpacing;
};

/**
 * CONTENT: Title text.
 */
export type DevActionTitle = {
  id: string;
  kind: 'title';
  text: string;
};

/**
 * INPUT: Simple clickable action.
 */
export type DevActionButton = {
  id: string;
  kind: 'button';
  label: string;
  description?: string;
  handler?: t.DevActionButtonHandler<any>;
};

/**
 * INPUT: A button with a toggle switch (boolean)
 */
export type DevActionBoolean = {
  id: string;
  kind: 'boolean';
  label: string;
  description?: string;
  current?: boolean; // Latest value produced by the handler.
  handler?: t.DevActionBooleanHandler<any>;
};
