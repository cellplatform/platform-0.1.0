import { minimist } from '../node/common/libs';

export * from '../node/common/types';

export type Commands = Record<string, Command>;
export type Command = {
  description: string;
  params: Record<string, string>;
};

export type Argv = minimist.ParsedArgs;
