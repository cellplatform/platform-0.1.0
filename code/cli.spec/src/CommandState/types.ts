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
  toString(options?: { delimiter?: string }): string;
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
export type CommandChangeDispatcher = (e: ICommandChange) => void;
export type ICommandChange = {
  text?: string;
  invoked?: boolean;
  namespace?: boolean | 'PARENT';
  autoCompleted?: ICommandAutoCompleted;
};

/**
 * [Invoke]
 */
export type BeforeInvokeCommand<P extends object = any, A extends object = any> = (args: {
  command: ICommand<P, A>;
  namespace?: ICommand<P, A>;
  state: ICommandStateProps;
  props: P;
}) => Promise<Partial<IInvokeCommandArgs<P, A>>>;

export type ICommandStateInvokeArgs = {
  props?: {};
  args?: string | ICommandArgs;
  timeout?: number;
  stepIntoNamespace?: boolean;
};
export type ICommandStateInvokeResponse = {
  isCancelled: boolean;
  isNamespaceChanged: boolean;
  isInvoked: boolean;
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
  | ICommandStateChangingEvent
  | ICommandStateChangedEvent
  | ICommandStateInvokingEvent
  | ICommandStateInvokedEvent
  | ICommandStateAutoCompletedEvent;

export type ICommandStateChangingEvent = {
  type: 'COMMAND_STATE/changing';
  payload: ICommandStateChanging;
};
export type ICommandStateChanging = {
  prev?: ICommandChange;
  next: ICommandChange;
  isCancelled: boolean;
  cancel(): void;
};

export type ICommandStateChangedEvent = {
  type: 'COMMAND_STATE/changed';
  payload: ICommandStateChanged;
};
export type ICommandStateChanged = {
  state: ICommandStateProps;
  invoked: boolean;
  namespace?: boolean;
};

export type ICommandStateInvokingEvent = {
  type: 'COMMAND_STATE/invoking';
  payload: ICommandStateInvoking;
};
export type ICommandStateInvoking = {
  state: ICommandStateProps;
  args: IInvokeCommandArgs;
  isCancelled: boolean;
  cancel(): void;
};

export type ICommandStateInvokedEvent = {
  type: 'COMMAND_STATE/invoked';
  payload: ICommandStateInvokeResponse;
};

export type ICommandStateAutoCompletedEvent = {
  type: 'COMMAND_STATE/autoCompleted';
  payload: ICommandAutoCompleted;
};
