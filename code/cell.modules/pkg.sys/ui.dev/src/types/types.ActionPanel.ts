import { t } from './common';

export type ActionPanelProps = {
  scrollable?: boolean;
  style?: t.CssValue;
};

export type DevActionItemClickEvent = { model: t.DevActionItem };
export type DevActionItemClickEventHandler = (e: DevActionItemClickEvent) => void;
