import * as t from './libs';

export type ShellTheme = 'LIGHT' | 'DARK';

/**
 * [Shell]
 */
export type IShell = {
  events: IShellEvents;
  state: IShellState;
  initial(state: IShellPartialState): IShell;
  register: ShellRegisterModule;
  main: ShellRegisterModule;
  load<P = {}>(
    moduleId: string | number,
    options?: IShellLoadOptions<P>,
  ): Promise<IShellLoadResponse>;
  progress: IShellProgress;
};

export type ShellRegisterModule = (
  moduleId: string,
  importer: ShellImporter,
  options?: { timeout?: number },
) => IShell;

export type IShellEvents = {
  events$: t.Observable<ShellEvent>;
  tree: t.ITreeEvents;
  progress: {
    start$: t.Observable<IShellProgressStart>;
    complete$: t.Observable<IShellProgressComplete>;
  };
};

export type IShellProgress = {
  start(options?: { duration?: number; color?: string }): Promise<{}>;
  complete(): void;
};

export type IShellLoadOptions<P = {}> = {
  props?: P;
  progress?: number; // msecs (estimate for progress bar to complete).
  simulateLatency?: number; // msecs (simulate load latency on localhost).
};

/**
 * [Context]
 */
export type IShellContext = {
  shell: IShell;
};

/**
 * [Importer]
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
  readonly changed$: t.Observable<IShellStateChanged>;
  readonly header: IShellHeaderState;
  readonly tree: IShellTreeState;
  readonly body: IShellBodyState;
  readonly sidebar: IShellSidebarState;
  readonly footer: IShellFooterState;
};
export type IShellPartialState = Partial<{
  header: Partial<IShellHeaderState>;
  tree: Partial<IShellTreeState>;
  body: Partial<IShellBodyState>;
  sidebar: Partial<IShellSidebarState>;
  footer: Partial<IShellFooterState>;
}>;

export type IShellHeaderState = {
  el?: JSX.Element;
  foreground: IShellColor | string | number;
  background: IShellColor | string | number;
  border: IShellColor | string | number;
  height: IShellSize | number;
};

export type IShellTreeState = {
  root?: t.ITreeNode;
  current?: string;
  width: IShellSize | number;
  render?: {
    node?: t.RenderTreeNodeBody;
    icon?: t.RenderTreeIcon;
    panel?: t.RenderTreePanel;
  };
};

export type IShellBodyState = {
  el?: JSX.Element;
  foreground: IShellColor | string | number;
  background: IShellColor | string | number;
};

export type IShellSidebarState = {
  el?: JSX.Element;
  foreground: IShellColor | string | number;
  background: IShellColor | string | number;
  width: IShellSize | number;
};

export type IShellFooterState = {
  el?: JSX.Element;
  foreground: IShellColor | string | number;
  background: IShellColor | string | number;
  border: IShellColor | string | number;
  height: IShellSize | number;
};

/**
 * Appearance
 */
export type IShellColor = { color: string; fadeSpeed: number };
export type IShellSize = { value: number; speed: number };

/**
 * [Events]
 */
export type ShellEvent = t.TreeViewEvent | IShellProgressStartEvent | IShellProgressCompleteEvent;

export type IShellProgressStartEvent = {
  type: 'SHELL/progress/start';
  payload: IShellProgressStart;
};
export type IShellProgressStart = { duration?: number; color?: string };

export type IShellProgressCompleteEvent = {
  type: 'SHELL/progress/complete';
  payload: IShellProgressComplete;
};
export type IShellProgressComplete = {};

export type IShellStateChanged = t.IPropChanged & {
  field: 'header' | 'footer' | 'tree' | 'body' | 'sidebar';
};
