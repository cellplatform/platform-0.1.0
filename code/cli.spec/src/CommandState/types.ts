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
export type CommandStateEvent = ICommandStateChangeEvent;

export type ICommandStateChangeEvent<P extends object = any> = {
  type: 'COMMAND/state/change';
  payload: ICommandStateProps<P> & { invoked: boolean };
};
