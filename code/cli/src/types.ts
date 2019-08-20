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
