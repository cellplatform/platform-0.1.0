import { CommandState } from '../common';
import { root } from './cmds';

export function init(args: {}) {
  const state = CommandState.create({
    root,
    beforeInvoke: async state => {
      return { props: { foo: 123 }, timeout: 5000 };
    },
  });

  return state;
}
