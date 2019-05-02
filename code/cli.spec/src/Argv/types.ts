export type CommandArgsParamType = string | number | boolean;
export type CommandArgsOptions = { [key: string]: CommandArgsParamType | undefined };

/**
 * Parsing `ARGV` strings.
 */
export type ICommandArgs<O extends CommandArgsOptions = {}> = {
  params: CommandArgsParamType[];
  options: O;
};
