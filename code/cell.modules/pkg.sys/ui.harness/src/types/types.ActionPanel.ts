import { t } from './common';

export type ActionPanelProps = {
  scrollable?: boolean;
  style?: t.CssValue;
};

export type ActionItemClickEvent = { model: t.ActionItem };
export type ActionItemClickEventHandler = (e: ActionItemClickEvent) => void;
