import { StateController as Controller } from './State.Controller';
import { useStateController as useController } from './State.useController';
import { Util } from '../Util';

export const CmdCardState = {
  Controller,
  useController,
  default: Util.defaultState,
};
