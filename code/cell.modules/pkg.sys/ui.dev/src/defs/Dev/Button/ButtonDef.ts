import { t } from '../common';
import { config } from './ButtonDef.config';
import { Button as Component } from './Button';

export const ButtonDef: t.ActionDef = {
  kind: 'dev/button',
  Component,

  config: {
    method: 'button',
    handler(args) {
      const { item } = config(args.ctx, args.params);
      args.actions.change((draft) => draft.items.push(item));
    },
  },
};
