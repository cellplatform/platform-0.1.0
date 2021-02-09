import { t } from '../common';
import { config } from './HrDef.config';
import { Hr as Component } from './Hr';

export const HrDef: t.ActionDef = {
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
