export { ParsedArgs as Argv } from 'minimist';
export { JsonMap } from '@platform/types';

export type Commands = Record<string, Command>;
export type Command = {
  description: string;
  params: Record<string, string>;
};
