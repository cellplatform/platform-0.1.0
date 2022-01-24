import { t } from '../common';

export type ActionsModelState<Ctx> = t.BuilderModel<t.ActionsModel<Ctx>>;

export type ActionsModel<Ctx> = {
  namespace: string;
  items: t.ActionItem[];
  ctx: { current?: Ctx; get?: t.ActionHandlerContext<Ctx> };
  env: ActionsModelEnv;
  subject?: t.ActionHandlerSubject<Ctx>;
  init?: t.ActionHandlerInit<Ctx>;
  initialized?: boolean;
  redraw$: t.Subject<void>;
};

export type ActionsModelEnv = {
  viaAction: ActionsModelEnvProps;
  viaSubject: ActionsModelEnvProps;
};

export type ActionsModelEnvProps = {
  host?: t.Host;
  layout?: t.HostedLayout;
  actions?: t.HostedActions;
};
