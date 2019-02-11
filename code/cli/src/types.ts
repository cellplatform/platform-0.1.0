/**
 * Commands
 */
export type IResult = {
  ok: boolean;
  code: number;
  error?: Error;
};

export type ITask = {
  title: string;
  task: () => Promise<IResult>;
};

export type ICommand = {
  title: string;
  cmd: string;
};
