import { VimeoBus as VimeoBusWeb } from '../web.Bus';
import { BusController as Controller } from './BusController';

export const VimeoBus = {
  ...VimeoBusWeb,
  Controller,
};
