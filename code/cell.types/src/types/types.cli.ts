export type CliInit = (app: ICliApp) => ICliApp;

export type ICliApp = {
  commands: ICliCommand[];
  command(cmd: ICliCommandArgs): ICliCommandResponse;
  run(): void;
};

export type ICliCommandArgs = {
  name: string;
  description: string;
  alias?: string;
};

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
