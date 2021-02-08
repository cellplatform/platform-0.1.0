import { t } from '../common';

type A = t.DevActionsChangeType;

export type DevActionsModelState<Ctx> = t.BuilderModel<t.DevActionsModel<Ctx>, A>;
export type DevActionsModel<Ctx> = {
  namespace: string;
  items: t.DevActionItem[];
  ctx: { current?: Ctx; get?: t.DevActionGetContext<Ctx> };
  env: {
    viaAction: DevActionsModelEnv;
    viaSubject: DevActionsModelEnv;
  };
  renderSubject?: t.DevActionHandlerSubject<Ctx>;
  initialized?: boolean;
};

export type DevActionsModelEnv = {
  host?: t.IDevHost;
  layout?: t.IDevHostedLayout;
};
