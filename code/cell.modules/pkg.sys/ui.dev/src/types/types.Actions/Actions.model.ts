import { t } from '../common';

export type ActionsModelState<Ctx> = t.BuilderModel<t.ActionsModel<Ctx>>;
export type ActionsModel<Ctx> = {
  namespace: string;
  items: t.ActionItem[];
  ctx: { current?: Ctx; get?: t.ActionGetContext<Ctx> };
  env: { viaAction: ActionsModelEnv; viaSubject: ActionsModelEnv };
  subject?: t.ActionHandlerSubject<Ctx>;
  initialized?: boolean;
};

export type ActionsModelEnv = {
  host?: t.Host;
  layout?: t.HostedLayout;
  actions?: t.HostedActions;
};
