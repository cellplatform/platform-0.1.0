import { BusController as Controller } from '../node.BusController';
import { BusEvents as Events } from '../web.BusEvents';
import { VercelHttp as Http } from '../node.VercelHttp';
import { VercelFs as Fs } from './Vercel.Fs';
import { VercelDeploy as Deploy } from './Vercel.Deploy';
import { VercelNode as Node } from './Vercel.Node';

export const Vercel = {
  Controller,
  Events,
  Http,
  Fs,
  Deploy,
  Node,
};
