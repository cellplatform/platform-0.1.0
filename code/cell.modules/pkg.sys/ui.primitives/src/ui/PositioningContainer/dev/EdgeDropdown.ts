import { ActionSelectConfigArgs } from 'sys.ui.dev';

import { EdgesX, EdgesY } from '../constants';
import { Ctx } from './types';

type D = ActionSelectConfigArgs<Ctx>;
type Args = { config: ActionSelectConfigArgs<Ctx>; title?: string; prefix?: string };
type ArgsHandler = (e: { value: string | undefined; ctx: Ctx }) => void;

export const EdgeDropdown = {
  configure(args: {
    config: D;
    title?: string;
    prefix?: string;
    items: string[];
    initial?: string;
    onChange?: ArgsHandler;
  }) {
    const { config, prefix, onChange } = args;
    config
      .title(args.title)
      .items(args.items)
      .initial(args.initial ?? args.items[0])
      .view('buttons')
      .pipe((e) => {
        const value = e.select.current[0];
        const label = value ? value.label : `unknown`;
        e.select.label = prefix ? `${prefix}: "${label}"` : label;
        if (onChange) onChange({ value: value.label, ctx: e.ctx });
      });
  },

  edges(edges: string[], args: Args, onChange?: ArgsHandler) {
    return EdgeDropdown.configure({ ...args, items: ['none', ...edges], onChange });
  },

  x(config: D, prefix: string, onChange?: ArgsHandler) {
    return EdgeDropdown.edges(EdgesX, { config, prefix }, onChange);
  },

  y(config: D, prefix: string, onChange?: ArgsHandler) {
    return EdgeDropdown.edges(EdgesY, { config, prefix }, onChange);
  },
};
