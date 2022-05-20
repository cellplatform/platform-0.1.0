import * as t from '../common/types';

type Index = number;

export type DataSample = {
  id: string;
  msg: string;
  truncatedAt?: Index;
};

export type Ctx = {
  id: string; // "Instance" id.
  bus: t.EventBus<any>;
  items: t.ListItem<DataSample>[];
  props: t.ListProps; // Common properties.
  renderCtx: RenderCtx;
  events: t.ListEvents;
  debug: DebugCtx;
  redraw(): Promise<void>;
};

export type DebugCtx = {
  virtualScroll: boolean;
  scrollAlign: t.ListItemAlign;
  virtualPadding: boolean;
  canFocus: boolean;
  mouseState?: t.ListMouse;
  selection?: t.ListSelectionConfig;
};

export type RenderCtx = {
  total: number;
  enabled: boolean;
  bulletKind: 'Lines' | 'Dot';
  bodyKind: 'Card' | 'Vanilla' | undefined;
  connectorRadius?: number;
  connectorLineWidth?: number;
};

export type DevSampleProps = {
  items: Ctx['items'];
  props: t.ListProps;
  debug: DebugCtx;
  renderCtx: RenderCtx;
};
