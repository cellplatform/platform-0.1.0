import { ICommand, ICommandArgs } from '../types';
import { Observable } from 'rxjs';

/**
 * Manages state of a CLI program.
 */
export type ICommandState = ICommandStateProps & {
  dispose$: Observable<{}>;
  events$: Observable<CommandStateEvent>;
  change$: Observable<ICommandStateChange>;
  invoke$: Observable<ICommandStateChange>;
  change: CommandChangeDispatcher;
};

export type ICommandStateProps = {
  root: ICommand;
  text: string;
  args: ICommandArgs;
  command: ICommand | undefined;
  namespace?: ICommandNamespace;
};

export type ICommandNamespace = {
  command: ICommand;
  path: ICommand[];
  toString(): string;
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
  payload: ICommandStateChange;
};
export type ICommandStateChange = {
  props: ICommandStateProps;
  invoked: boolean;
  namespace?: boolean;
};
