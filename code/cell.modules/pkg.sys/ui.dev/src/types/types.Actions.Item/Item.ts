import { t } from '../common';

/**
 * Item types.
 */
export type ActionItem = t.ActionItemInput | t.ActionItemContent;
export type ActionItemContent = t.ActionTitle | t.ActionHr;
export type ActionItemInput = t.ActionButton | t.ActionBoolean | t.ActionSelect;
