import { BusController as Controller } from '../node.BusController';
import { BusEvents as Events } from '../web.BusEvents';
import { VercelHttp as Http } from '../node.VercelHttp';
import { VercelFs as Fs } from './Vercel.Fs';
import { VercelDeploy as Deploy } from './Vercel.Deploy';

export const Vercel = {
  Controller,
  Events,
  Http,
  Fs,
  Deploy,
};
