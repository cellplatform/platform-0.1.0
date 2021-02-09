import { t } from '../common';
import { config } from './SelectDef.config';
import { Select as Component } from './Select';

export const SelectDef: t.ActionDef = {
  kind: 'dev/select',
  Component,

  config: {
    method: 'select',
    handler(args) {
      const { item } = config(args.ctx, args.params);
      args.actions.change((draft) => draft.items.push(item));
    },
  },
};
