import { ICommand, ICommandArgs } from '../types';

/**
 * Manages state of a CLI program.
 */
export type ICommandState = {
  text: string;
  args: ICommandArgs;
  command: ICommand | undefined;
  namespace?: ICommandNamespace;
};

export type ICommandNamespace = {
  command: ICommand;
  path: ICommand[];
};

/**
 * [Change] delegate.
 */
export type CommandChangeDispatcher = (e: ICommandChangeArgs) => void;
export type ICommandChangeArgs = {
  readonly text: string;
  readonly invoked?: boolean;
  readonly namespace?: boolean;
};

/**
 * [Events]
 */
export type CommandStateEvent = ICommandStateChangeEvent;

export type ICommandStateChangeEvent = {
  type: 'COMMAND/state/change';
  payload: ICommandState & { invoked: boolean };
};
