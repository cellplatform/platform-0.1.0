import { ITreeNode } from '@platform/ui.tree/lib/types';

export type ShellTheme = 'LIGHT' | 'DARK';

/**
 * [Context]
 */
export type IShellContext = {
  shell: IShell;
};

/**
 * [Module-Import]
 */
export type ShellImporter<P = {}> = (props?: P) => Promise<ShellImporterResponse>;
export type ShellImporterResponse = { init: ShellImportInit };

export type ShellImportInit = (args: ShellImportInitArgs) => Promise<any>;
export type ShellImportInitArgs = { shell: IShell };

export type IShell = {
  state: IShellState;
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

/**
 * [State]
 */

/**
 * Model for controlling the <Shell>.
 */
export type IShellState = {
  readonly tree: IShellTreeState;
  readonly body: IShellBodyState;
  readonly sidepanel: IShellSidepanelState;
};

export type IShellTreeState = {
  root?: ITreeNode;
  current?: string;
};

export type IShellBodyState = {
  el?: JSX.Element;
  foreground: IColor | string | number;
  background: IColor | string | number;
};

export type IShellSidepanelState = {
  el?: JSX.Element;
  foreground: IColor | string | number;
  background: IColor | string | number;
};

/**
 * Values
 */
export type IColor = { color: string; fadeSpeed: number };
