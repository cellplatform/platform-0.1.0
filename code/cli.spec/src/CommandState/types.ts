import * as t from '../types';
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
  root: t.ICommand;
  text: string;
  args: t.ICommandArgs;
  command: t.ICommand | undefined;
  namespace: ICommandNamespace;
  autoCompleted?: ICommandAutoCompleted;
  fuzzy: ICommandStateFuzzy;
};

export type ICommandNamespace = {
  name: string;
  command: t.ICommand;
  path: t.ICommand[];
  isRoot: boolean;
  toString(options?: { delimiter?: string }): string;
};

export type ICommandAutoCompleted = {
  index: number;
  text: { from: string; to: string };
  matches: t.ICommand[];
};

export type ICommandStateFuzzy = {
  matches: ICommandFuzzyMatch[];
};
export type ICommandFuzzyMatch = {
  command: t.ICommand;
  isMatch: boolean;
};

/**
 * [Change] delegate.
 */
export type CommandChangeDispatcher = (e: ICommandChange) => void;
export type ICommandChange = {
  text?: string;
  invoke?: boolean;
  namespace?: boolean | 'PARENT';
  autoCompleted?: ICommandAutoCompleted;
};

/**
 * [Invoke]
 */
export type BeforeInvokeCommand<
  P extends object = any,
  A extends t.CommandArgsOptions = any
> = (args: {
  command: t.ICommand<P, A>;
  namespace?: t.ICommand<P, A>;
  state: ICommandStateProps;
  props: P;
}) => Promise<Partial<t.IInvokeCommandArgs<P, A>>>;

export type ICommandStateInvokeArgs = {
  props?: {};
  args?: string | t.ICommandArgs;
  timeout?: number;
  stepIntoNamespace?: boolean;
};
export type ICommandStateInvokeResponse = {
  isCancelled: boolean;
  isNamespaceChanged: boolean;
  isInvoked: boolean;
  state: ICommandStateProps;
  props: { [key: string]: any };
  args: t.ICommandArgs;
  timeout: number;
  response?: t.IInvokedCommandResponse<any, any, any>;
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
  args: {
    prev?: ICommandChange;
    next: ICommandChange;
  };
  isCancelled: boolean;
  cancel(): void;
};

export type ICommandStateChangedEvent = {
  type: 'COMMAND_STATE/changed';
  payload: ICommandStateChanged;
};
export type ICommandStateChanged = {
  invoke: boolean;
  isNamespaceChanged?: boolean;
  prev: ICommandStateProps;
  next: ICommandStateProps;
};

export type ICommandStateInvokingEvent = {
  type: 'COMMAND_STATE/invoking';
  payload: ICommandStateInvoking;
};
export type ICommandStateInvoking = {
  state: ICommandStateProps;
  args: t.IInvokeCommandArgs;
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
