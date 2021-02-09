import { t } from '../common';
import { config } from './BooleanDef.config';
import { Bool as Component } from './Bool';

export const BooleanDef: t.ActionDef = {
  kind: 'dev/boolean',
  Component,

  config: {
    method: 'boolean',
    handler(args) {
      const { item } = config(args.ctx, args.params);
      args.actions.change((draft) => draft.items.push(item));
    },
  },
};
