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
import { ICommandState, datagrid } from '../common';

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
  grid: ITestGridState;
  network?: INetworkRenderer;
  error(err: Error | string): void;
};

export type ITestGridState = {
  selection?: datagrid.IGridSelection;
};

export type ICommandOptions = {};

/**
 * [Events]
 */
export type CommandLineEvent =
  | ITestChangeEditorCellEvent
  | ITestSelectDbEvent
  | ITestErrorEvent
  | ITestDbValuesEvent
  | ITestGridChangeEvent;

export type ITestErrorEvent = {
  type: 'CLI/error';
  payload: { message: string; command: ICommand };
};

export type ITestSelectDbEvent = {
  type: 'CLI/db/select';
  payload: { dir: string };
};

export type ITestDbValuesEvent = {
  type: 'CLI/db/values';
  payload: { values: any };
};

export type ITestChangeEditorCellEvent = {
  type: 'CLI/editor/cell';
  payload: { cellKey: string };
};

export type ITestGridChangeEvent = {
  type: 'CLI/grid/change';
  payload: {
    state: ITestGridState;
  };
};
