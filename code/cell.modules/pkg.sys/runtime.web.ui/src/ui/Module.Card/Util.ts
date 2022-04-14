import { t, CmdCard } from './common';
import { Body } from './ui/Body';
import { Backdrop } from './ui/Backdrop';

export const Util = {
  /**
   * Generate a new "default state" object.
   */
  defaultState() {
    const body: t.ModuleCardBodyState = {};
    const backdrop: t.ModuleCardBackdropState = {};

    const state = CmdCard.defaultState();
    state.body.render = Body.render;
    state.body.state = body;

    state.backdrop.render = Backdrop.render;
    state.backdrop.state = backdrop;

    return state;
  },
};
