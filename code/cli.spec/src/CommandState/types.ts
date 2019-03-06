import { ICommand, ICommandArgs } from '../types';

/**
 * Manages state of a CLI program.
 */
export type ICommandState = ICommandStateProps & {
  toString(): string;
  toObject(): ICommandStateProps;
};

export type ICommandStateProps = {
  text: string;
  command: ICommand | undefined;
  args: ICommandArgs;
};

/**
 * Change delegate.
 */
export type CommandChangeDispatcher = (e: ICommandChangeArgs) => void;
export type ICommandChangeArgs = {
  readonly text: string;
  readonly invoked?: boolean;
};

/**
 * [Events]
 */
export type CommandStateEvent = ICommandStateChangeEvent;

export type ICommandStateChangeEvent = {
  type: 'COMMAND/state/change';
  payload: ICommandStateProps & { invoked: boolean };
};
