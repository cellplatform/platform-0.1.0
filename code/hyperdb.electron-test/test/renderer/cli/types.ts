import { Subject } from 'rxjs';
import {
  ICommand,
  ICommandArgs,
  ITestRendererDb,
  IDbRendererFactory,
  INetworkRenderer,
  ITestStore,
  ILog,
} from '../../types';
import { ICommandState } from '../common';

export { ITestRendererDb };

export type ITestCommandLine = {
  state: ICommandState;
  events$: Subject<CommandLineEvent>;
  databases: IDbRendererFactory;
  invoke(args: ITestCommandLineInvokeArgs): any;
};

export type ITestCommandLineInvokeArgs = {
  command: ICommand<ITestCommandProps>;
  args: ICommandArgs;
  db?: ITestRendererDb;
};

export type ITestCommandProps = {
  databases: IDbRendererFactory;
  store: ITestStore;
  log: ILog;
  events$: Subject<CommandLineEvent>;
  db?: ITestRendererDb;
  network?: INetworkRenderer;
  error(err: Error | string): void;
};

export type ICommandOptions = {};

/**
 * [Events]
 */
export type CommandLineEvent = ITestChangeEditorCellEvent | ITestSelectDbEvent | ITestErrorEvent;

export type ITestErrorEvent = {
  type: 'CLI/error';
  payload: { message: string; command: ICommand };
};

export type ITestSelectDbEvent = {
  type: 'CLI/db/select';
  payload: { dir: string };
};

export type ITestChangeEditorCellEvent = {
  type: 'CLI/editor/cell';
  payload: { cellKey: string };
};
