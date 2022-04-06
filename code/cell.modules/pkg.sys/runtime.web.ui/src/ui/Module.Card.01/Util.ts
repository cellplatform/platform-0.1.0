import { t, CmdCard } from './common';

export const Util = {
  defaultState(): t.ModuleCardState {
    return {
      card: CmdCard.State.default(),
    };
  },
};
