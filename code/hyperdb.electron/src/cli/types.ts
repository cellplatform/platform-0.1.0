/**
 * Manages state of a CLI program.
 */
export type ICommandState = {};

/**
 * Change delegate.
 */
export type CommandChangeDispatcher = (e: ICommandChangeArgs) => void;
export type ICommandChangeArgs = {
  readonly text: string;
  readonly invoked: boolean;
};

/**
 * Events
 */
export type CommandEvent = ICommandChangeEvent;

export type ICommandChangeEvent = {
  type: 'COMMMAND/change';
  payload: ICommandState;
};
