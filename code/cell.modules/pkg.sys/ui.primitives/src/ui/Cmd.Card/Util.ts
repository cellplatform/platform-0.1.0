import { t, R } from './common';

/**
 * Genrate a new "default state" object.
 */
export function defaultState(override?: t.PartialDeep<t.CmdCardState>): t.CmdCardState {
  const state: t.CmdCardState = {
    commandbar: {},
    backdrop: {},
    body: { show: 'CommandBar' },
  };
  return override ? R.mergeDeepRight(state, override as any) : state;
}

/**
 * [Helpers]
 */
export const Util = {
  defaultState,
};
