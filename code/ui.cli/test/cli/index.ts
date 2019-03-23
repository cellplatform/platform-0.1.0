import { CommandState } from '../common';
import { root } from './cmds';

export function init(args: {}) {
  const state = CommandState.create({ root });
  return {
    state,
  };
}
