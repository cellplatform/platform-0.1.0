import { StateController as Controller } from './State.Controller';
import { useStateController as useController } from './State.useStateController';
import { Util } from '../Util';

export const State = {
  Controller,
  useController,
  default: Util.defaultState,
};
