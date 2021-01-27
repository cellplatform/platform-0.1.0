import { t } from '../common';

/**
 * Item types.
 */
export type DevActionItem = t.DevActionItemInput | t.DevActionItemContent;
export type DevActionItemContent = t.DevActionTitle | t.DevActionHr;
export type DevActionItemInput = t.DevActionButton | t.DevActionBoolean | t.DevActionSelect;

/**
 * CONTENT: Title text.
 */
export type DevActionTitle = {
  id: string;
  kind: 'title';
  text: string;
};

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
