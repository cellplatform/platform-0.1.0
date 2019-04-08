import { ICommand, ICommandArgs, IInvokeCommandArgs, IInvokedCommandResponse } from '../types';
import { Observable } from 'rxjs';

/**
 * Manages state of a CLI program.
 */
export type ICommandState = ICommandStateProps & {
  dispose$: Observable<{}>;
  events$: Observable<CommandStateEvent>;
  changed$: Observable<ICommandStateChanged>;
  invoke$: Observable<ICommandStateChanged>;
  invoking$: Observable<ICommandStateInvoking>;
  invoked$: Observable<ICommandStateInvokeResponse>;
  change: CommandChangeDispatcher;
  invoke(options?: ICommandStateInvokeArgs): Promise<ICommandStateInvokeResponse>;
};

export type ICommandStateProps = {
  root: ICommand;
  text: string;
  args: ICommandArgs;
  command: ICommand | undefined;
  namespace?: ICommandNamespace;
  autoCompleted?: ICommandAutoCompleted;
  fuzzyMatches: ICommandFuzzyMatch[];
};

export type ICommandNamespace = {
  name: string;
  command: ICommand;
  path: ICommand[];
  toString(): string;
};

export type ICommandAutoCompleted = {
  index: number;
  text: { from: string; to: string };
  matches: ICommand[];
};

export type ICommandFuzzyMatch = {
  command: ICommand;
  isMatch: boolean;
};

/**
 * [Change] delegate.
 */
export type CommandChangeDispatcher = (e: ICommandChangeArgs) => void;
export type ICommandChangeArgs = {
  text: string;
  invoked?: boolean;
  namespace?: boolean;
  autoCompleted?: ICommandAutoCompleted;
};

/**
 * [Invoke]
 */
export type InvokeCommandArgsFactory<P extends object = any, A extends object = any> = (
  state: ICommandStateProps,
) => Promise<IInvokeCommandArgs<P, A>>;

export type ICommandStateInvokeArgs = {
  props?: {};
  args?: string | ICommandArgs;
  timeout?: number;
  stepIntoNamespace?: boolean;
};

export type ICommandStateInvokeResponse = {
  cancelled: boolean;
  namespaceChanged: boolean;
  invoked: boolean;
  state: ICommandStateProps;
  props: { [key: string]: any };
  args: ICommandArgs;
  timeout: number;
  response?: IInvokedCommandResponse<any, any, any>;
};

/**
 * [Events]
 */
export type CommandStateEvent =
  | ICommandStateChangedEvent
  | ICommandStateInvokingEvent
  | ICommandStateInvokedEvent
  | ICommandStateAutoCompletedEvent;

export type ICommandStateChangedEvent = {
  type: 'COMMAND/state/changed';
  payload: ICommandStateChanged;
};
export type ICommandStateChanged = {
  props: ICommandStateProps;
  invoked: boolean;
  namespace?: boolean;
};

export type ICommandStateInvokingEvent = {
  type: 'COMMAND/state/invoking';
  payload: ICommandStateInvoking;
};
export type ICommandStateInvoking = {
  state: ICommandStateProps;
  args: IInvokeCommandArgs;
  isCancelled: boolean;
  cancel(): void;
};

export type ICommandStateInvokedEvent = {
  type: 'COMMAND/state/invoked';
  payload: ICommandStateInvokeResponse;
};

export type ICommandStateAutoCompletedEvent = {
  type: 'COMMAND/state/autoCompleted';
  payload: ICommandAutoCompleted;
};
