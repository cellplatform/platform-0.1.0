import { BusController as Controller, BusEvents as Events } from '../Bus';
import { VercelHttp as Http } from '../Vercel.Http';
import { VercelFs as Fs, VercelInfo as Info } from './common';
import { VercelDeploy as Deploy } from './Vercel.Deploy';
import { VercelNode as Node } from './Vercel.Node';

export const Vercel = {
  Fs,
  Controller,
  Events,
  Http,
  Deploy,
  Node,
  Info,
};
