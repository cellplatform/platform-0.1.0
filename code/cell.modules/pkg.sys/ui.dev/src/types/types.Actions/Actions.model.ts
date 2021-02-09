import { t } from '../common';

type A = t.ActionsChangeType;

export type ActionsModelState<Ctx> = t.BuilderModel<t.ActionsModel<Ctx>, A>;
export type ActionsModel<Ctx> = {
  namespace: string;
  items: t.ActionItem[];
  ctx: { current?: Ctx; get?: t.ActionGetContext<Ctx> };
  env: { viaAction: ActionsModelEnv; viaSubject: ActionsModelEnv };
  renderSubject?: t.ActionHandlerSubject<Ctx>;
  initialized?: boolean;
};

export type ActionsModelEnv = {
  host?: t.Host;
  layout?: t.HostedLayout;
};
