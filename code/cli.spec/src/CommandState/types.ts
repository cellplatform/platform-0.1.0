import { ICommand, ICommandArgs } from '../types';

/**
 * Manages state of a CLI program.
 */
export type ICommandState<A extends object = any> = ICommandStateProps<A> & {
  toString(): string;
  toObject(): ICommandStateProps<A>;
};

export type ICommandStateProps<A extends object = any> = {
  text: string;
  command: ICommand | undefined;
  args: ICommandArgs<A>;
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
export type CommandEvent = ICommandChangeEvent | ICommandInvokeEvent;

export type ICommandChangeEvent<P extends object = any> = {
  type: 'COMMAND/change';
  payload: ICommandStateProps<P>;
};

export type ICommandInvokeEvent<P extends object = any> = {
  type: 'COMMAND/invoke';
  payload: ICommandStateProps<P>;
};
