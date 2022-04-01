import { t, R } from './common';

/**
 * Genrate a new "default state" object.
 */
export function defaultState(partial?: t.PartialDeep<t.CmdCardState>): t.CmdCardState {
  const state: t.CmdCardState = {
    commandbar: {},
    backdrop: {},
    body: { show: 'CommandBar' },
  };
  return partial ? R.mergeDeepRight(state, partial as any) : state;
}

/**
 * [Helpers]
 */
export const Util = {
  defaultState,
};
