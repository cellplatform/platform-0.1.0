/**
 * Commands
 */
export type IResult = {
  ok: boolean;
  code: number;
  error?: Error;
  info: string[];
  errors: string[];
};

export type ITask = {
  title: string;
  task: () => Promise<IResult>;
};

export type ICommand = {
  title: string;
  cmd: string;
};
