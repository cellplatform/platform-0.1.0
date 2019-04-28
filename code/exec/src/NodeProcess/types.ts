export type NodeProcessArgs = {
  cwd: string;
  NPM_TOKEN?: string;
};

/**
 * [Events]
 */
export type NodeProcessEvent =
  | INodeProcessStarting
  | INodeProcessStarted
  | INodeProcessStopping
  | INodeProcessStopped;

export type INodeProcessStarting = {
  type: 'PROCESS/starting';
  payload: { cwd: string; isCancelled: boolean; cancel(): void };
};
export type INodeProcessStarted = {
  type: 'PROCESS/started';
  payload: { cwd: string; port?: number };
};

export type INodeProcessStopping = {
  type: 'PROCESS/stopping';
  payload: { cwd: string; isCancelled: boolean; cancel(): void };
};
export type INodeProcessStopped = {
  type: 'PROCESS/stopped';
  payload: { cwd: string };
};
