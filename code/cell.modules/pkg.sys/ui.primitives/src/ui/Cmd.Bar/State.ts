import { CmdBarStateController as Controller } from './State.Controller';
import { Util } from './Util';

export const State = {
  Controller,
  changed: Util.stateChanged,
};
