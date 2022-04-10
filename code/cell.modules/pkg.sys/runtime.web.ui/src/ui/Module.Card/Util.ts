import { t, CmdCard } from './common';
import { Body } from './ui/Body';

export const Util = {
  /**
   * Generate a new "default state" object.
   */
  defaultState() {
    // const body: t.ModuleCardStateBody = { tmp: 0 };
    // const backdrop: t.ModuleCardStateBackdrop = { tmp: 0 };

    return CmdCard.State.default<t.ModuleCardStateBody, t.ModuleCardStateBackdrop>({
      body: {
        render: Body.render,
        state: { tmp: 0 },
      },
      backdrop: {
        state: { tmp: 0 },
      },
    });
  },
};
