export type CliInit = (app: ICmdPlugins) => ICmdPlugins;

/**
 * CLI Plugins
 */

export type ICmdPlugins = {
  commands: ICmdPlugin[];
  command<T extends object = {}>(cmd: ICmdPluginCommandArgs<T>): ICmdPluginResponse;
  run(): void;
};

export type ICmdPluginCommandArgs<T extends object = {}> = {
  name: string;
  description: string;
  alias?: string;
  handler: CmdPluginHandler<T>;
};
export type ICmdPlugin = ICmdPluginCommandArgs & {
  options: Array<ICmdPluginOption<any>>;
};

export type CmdPluginHandler<T extends object = {}> = (args: T) => Promise<any>;

export type ICmdPluginResponse = ICmdPlugin & {
  option<T extends keyof ICmdPluginType>(args: ICmdPluginOption<T>): ICmdPluginResponse;
};

export type ICmdPluginOption<T extends keyof ICmdPluginType> = {
  name: string;
  description: string;
  alias?: string;
  type: T;
  default: ICmdPluginType[T];
};

export type ICmdPluginType = {
  boolean: boolean;
  string: string;
  number: number;
};
