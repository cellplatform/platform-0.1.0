import { fromClient } from './fetch.fromClient';
import { fromFuncs } from './fetch.fromFuncs';
import { stub } from './fetch.stub';

export const fetcher = {
  fromClient,
  fromFuncs,
  stub,
};
