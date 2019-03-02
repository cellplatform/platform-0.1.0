import minimist from 'minimist';

export type InvokeCommandEvent = {
  input: string;
  args: minimist.ParsedArgs;
  command: string;
};
export type InvokeCommandEventHandler = (e: InvokeCommandEvent) => void;
