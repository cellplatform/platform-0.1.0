export type Task = (args: TaskArgs) => Promise<any> | any;
export type TaskArgs = {
  message: (text: string) => void;
  done: () => void;
  error: (err: Error | string) => void;
};

export type ITaskError = {
  index: number;
  title: string;
  error: string;
};

export type ITasks = {
  length: number;
  task: AddTask;
  skip: AddTask;
  run(options?: IRunTasksOptions): Promise<IRunTasksResponse>;
};
export type AddTask = (title: string, task: Task) => ITasks;
export type IRunTasksOptions = {
  concurrent?: boolean;
  silent?: boolean;
  exitOnError?: boolean;
};
export type IRunTasksResponse = {
  ok: boolean;
  code: number;
  error?: string;
  errors: ITaskError[];
};
