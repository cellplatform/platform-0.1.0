export type CliInit = (app: ICliApp) => ICliApp;

export type ICliApp = {
  commands: ICliCommand[];
  command<T extends object = {}>(cmd: ICliCommandArgs<T>): ICliCommandResponse;
  run(): void;
};

export type ICliCommandArgs<T extends object = {}> = {
  name: string;
  description: string;
  alias?: string;
  handler: CommandHandler<T>;
};

export type CommandHandler<T extends object = {}> = (args: T) => Promise<any>;

export type ICliCommand = ICliCommandArgs & {
  options: Array<ICliOption<any>>;
};

export type ICliCommandResponse = ICliCommand & {
  option<T extends keyof ICliOptionType>(args: ICliOption<T>): ICliCommandResponse;
};

export type ICliOption<T extends keyof ICliOptionType> = {
  name: string;
  description: string;
  alias?: string;
  type: T;
  default: ICliOptionType[T];
};

export type ICliOptionType = {
  boolean: boolean;
  string: string;
  number: number;
};
