import { t } from '../common';
import { config } from './HrDef.config';
import { Hr as Component } from '../../../components/Action.display';

export const HrDef: t.ActionDef<t.ActionHr> = {
  kind: 'display/hr',
  Component,

  config: {
    method: 'hr',
    handler(args) {
      const { item } = config(args.ctx, args.params);
      args.actions.change((draft) => draft.items.push(item));
    },
  },
};
