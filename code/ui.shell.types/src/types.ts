import { ITreeNode, TreeViewEvent, ITreeEvents } from '@platform/ui.tree/lib/types';
import { Observable } from 'rxjs';

export type ShellTheme = 'LIGHT' | 'DARK';

/**
 * [Shell]
 */
export type IShell = {
  events: IShellEvents;
  state: IShellState;
  register(moduleId: string, importer: ShellImporter, options?: { timeout?: number }): IShell;
  default(moduleId: string): IShell;
  load<P = {}>(moduleId: string | number, props?: P): Promise<IShellLoadResponse>;
};

export type IShellEvents = {
  events$: Observable<ShellEvent>;
  tree: ITreeEvents;
};

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
  foreground: IShellColor | string | number;
  background: IShellColor | string | number;
};

export type IShellSidepanelState = {
  el?: JSX.Element;
  foreground: IShellColor | string | number;
  background: IShellColor | string | number;
};

export type IShellColor = { color: string; fadeSpeed: number };

/**
 * [Events]
 */
export type ShellEvent = TreeViewEvent;
