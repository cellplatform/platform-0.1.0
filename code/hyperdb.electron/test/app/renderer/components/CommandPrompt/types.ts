import minimist from 'minimist';

export type InvokeCommandEvent = {
  input: string;
  args: minimist.ParsedArgs;
  command: string;
  invoked: boolean;
};
export type InvokeCommandEventHandler = (e: InvokeCommandEvent) => void;
