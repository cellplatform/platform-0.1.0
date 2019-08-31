import * as t from '../common/types';

export type ShellImporter<P = {}> = (props?: P) => Promise<ShellImporterResponse>;
export type ShellImporterResponse = { init: ShellImportInit };

export type ShellImportInit = (args: ShellImportInitArgs) => Promise<any>;
export type ShellImportInitArgs = { shell: IShell };

export type IShell = {
  state: t.IShellState;
  register(moduleId: string, importer: ShellImporter, options?: { timeout?: number }): IShell;
  default(moduleId: string): IShell;
  load<P = {}>(moduleId: string | number, props?: P): Promise<IShellLoadResponse>;
};

export type IShellLoadResponse = {
  ok: boolean;
  count: number;
  error?: Error;
  timedOut: boolean;
};
