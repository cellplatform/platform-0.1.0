import { t } from '../common';

export type ActionsModelState<Ctx> = t.BuilderModel<t.ActionsModel<Ctx>>;

export type ActionsModel<Ctx> = {
  namespace: string;
  items: t.ActionItem[];
  ctx: {
    current?: Ctx;
    get?: t.ActionGetContext<Ctx>;
    count?: number; // Number of times the context [get] handler has been called. NB: Used to reset session when changing action-set.
  };
  env: ActionsModelEnv;
  subject?: t.ActionHandlerSubject<Ctx>;
  initialized?: boolean;
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
