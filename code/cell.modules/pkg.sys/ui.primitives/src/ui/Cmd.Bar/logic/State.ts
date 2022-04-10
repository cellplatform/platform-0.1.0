import { CmdBarStateController as Controller } from './State.Controller';
import { Util } from '../Util';

export const CmdBarState = {
  Controller,
  changed: Util.stateChanged,
};
