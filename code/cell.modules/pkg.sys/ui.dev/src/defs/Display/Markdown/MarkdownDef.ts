import { t } from '../common';
import { config } from './MarkdownDef.config';
import { Markdown as Component } from '../../../ui/Action.Display';

export const MarkdownDef: t.ActionDef<t.ActionMarkdown> = {
  kind: 'display/markdown',
  Component,

  config: {
    method: 'markdown',
    handler(args) {
      const { item } = config(args.ctx, args.params);
      args.actions.change((draft) => draft.items.push(item));
    },
  },
};
