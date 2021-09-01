import { ActionSelectConfigArgs } from 'sys.ui.dev';

import { EdgesX, EdgesY } from '../constants';
import { Ctx } from './types';

const UNDEFINED = '<undefined>';

type D = ActionSelectConfigArgs<Ctx>;
type Args = {
  config: ActionSelectConfigArgs<Ctx>;
  title?: string;
  prefix?: string;
  initial?: string;
};
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
        const current = e.select.current[0];
        const label = current ? current.label : `<unknown>`;
        e.select.label = prefix ? `${prefix}: "${label}"` : label;
        if (onChange) {
          const value = current.label === UNDEFINED ? undefined : current.label;
          onChange({ value, ctx: e.ctx });
        }
      });
  },

  edges(edges: string[], args: Args, onChange?: ArgsHandler) {
    return EdgeDropdown.configure({ ...args, items: [UNDEFINED, ...edges], onChange });
  },

  x(config: D, prefix: string, initial?: string, onChange?: ArgsHandler) {
    return EdgeDropdown.edges(EdgesX, { config, initial, prefix }, onChange);
  },

  y(config: D, prefix: string, initial?: string, onChange?: ArgsHandler) {
    return EdgeDropdown.edges(EdgesY, { config, initial, prefix }, onChange);
  },
};
