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
 * [Invoke]
 */
export type InvokeCommandArgsFactory<P extends object = any, A extends object = any> = (
  state: ICommandStateProps,
) => Promise<IInvokeCommandArgs<P, A>>;

export type ICommandStateInvokeResponse = {
  cancelled: boolean;
  invoked: boolean;
  state: ICommandStateProps;
  args: IInvokeCommandArgs;
  timeout: number;
  response?: IInvokedCommandResponse<any, any, any>;
};

/**
 * [Events]
 */
export type CommandStateEvent =
  | ICommandStateChangedEvent
  | ICommandStateInvokingEvent
  | ICommandStateInvokedEvent;

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
  payload: {
    state: ICommandStateProps;
    args: IInvokeCommandArgs;
    cancelled: boolean;
    cancel(): void;
  };
};

export type ICommandStateInvokedEvent = {
  type: 'COMMAND/state/invoked';
  payload: ICommandStateInvokeResponse;
};
