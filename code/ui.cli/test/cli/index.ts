import { CommandState } from '../common';
import { root } from './commands';

export function init(args: {}) {
  const state = CommandState.create({ root });
  return {
    state,
  };
}
