import { BusController as Controller } from '../node.BusController';
import { BusEvents as Events } from '../web.Bus';
import { VercelHttp as Http } from '../node.VercelHttp';
import { VercelFs as Fs } from './Vercel.Fs';
import { VercelDeploy as Deploy } from './Vercel.Deploy';
import { VercelNode as Node } from './Vercel.Node';

export const Vercel = {
  Fs,
  Controller,
  Events,
  Http,
  Deploy,
  Node,
};
