import { Subject } from 'rxjs';
import { ITestRendererDb, IDbRendererFactory, INetworkRenderer } from '../../types';
import { ICommandState } from '../common';

export { ITestRendererDb };

export type ICommandLine = {
  state: ICommandState;
  events$: Subject<CommandLineEvent>;
  db: IDbRendererFactory;
};
export type ICommandProps = {
  db?: ITestRendererDb;
  network?: INetworkRenderer;
  view?: 'WATCH';
  events$: Subject<CommandLineEvent>;
};

export type ICommandOptions = {};

/**
 * [Events]
 */
export type CommandLineEvent = INewDbEvent | IJoinDbEvent | IEditorChangeCellEvent;

export type INewDbEvent = {
  type: 'CLI/db/new';
  payload: {};
};

export type IJoinDbEvent = {
  type: 'CLI/db/join';
  payload: { dbKey?: string };
};

export type IEditorChangeCellEvent = {
  type: 'CLI/editor/cell';
  payload: { cellKey: string };
};
