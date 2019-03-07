import { Subject } from 'rxjs';
import { ITestRendererDb } from '../../types';

export type ITestCommandProps = {
  db?: ITestRendererDb;
  view?: 'WATCH';
  events$: Subject<CliEvent>;
};

export type ITestCommandOptions = {};

/**
 * Events
 */
export type CliEvent = ICliNewDbEvent | ICliJoinDbEvent;

export type ICliNewDbEvent = {
  type: 'CLI/db/new';
  payload: {};
};

export type ICliJoinDbEvent = {
  type: 'CLI/db/join';
  payload: {};
};
