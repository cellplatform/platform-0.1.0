import { t } from '../common';

type O = Record<string, unknown>;

export type ActionSubject<C extends O> = {
  ctx: C;
  items: t.ActionSubjectItem[];
  layout: t.HostedLayout; // NB: Default layout (individual item layout merged into this)
};

export type ActionSubjectItem = {
  el: JSX.Element;
  layout?: t.HostedLayout;
};
