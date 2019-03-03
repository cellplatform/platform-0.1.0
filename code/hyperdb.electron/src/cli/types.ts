/**
 * Manages state of a CLI program.
 */
export type ICommandState<P extends object = any> = {};

/**
 * Change delegate.
 */
export type CommandChangeDispatcher = (e: ICommandChangeArgs) => void;
export type ICommandChangeArgs = {
  readonly text: string;
  readonly invoked?: boolean;
};

/**
 * Events
 */
export type CommandEvent = ICommandChangeEvent;

export type ICommandChangeEvent<P extends object = any> = {
  type: 'COMMMAND/change';
  payload: ICommandState<P>;
};
