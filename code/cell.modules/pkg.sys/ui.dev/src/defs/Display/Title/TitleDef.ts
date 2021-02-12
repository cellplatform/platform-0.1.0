import { t } from '../common';
import { config } from './TitleDef.config';
import { Title as Component } from './Title';

export const TitleDef: t.ActionDef<t.ActionTitle> = {
  kind: 'display/title',
  Component,

  config: {
    method: 'title',
    handler(args) {
      const { item } = config(args.ctx, args.params);
      args.actions.change((draft) => draft.items.push(item));
    },
  },
};
