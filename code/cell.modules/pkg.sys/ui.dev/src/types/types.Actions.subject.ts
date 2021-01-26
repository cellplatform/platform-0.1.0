import { t } from './common';

type O = Record<string, unknown>;

export type DevActionSubject<C extends O> = {
  ctx: C;
  items: t.DevActionSubjectItem[];
  layout: t.IDevHostedLayout; // NB: Default layout (individual item layout merged into this)
};

export type DevActionSubjectItem = {
  el: JSX.Element;
  layout?: t.IDevHostedLayout;
};
