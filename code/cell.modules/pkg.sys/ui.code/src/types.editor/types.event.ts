import { t } from './common';

export type CodeEditorEventBus = t.EventBus<t.CodeEditorEvent>;
export type CodeEditorEvent = CodeEditorInstanceEvent | CodeEditorSingletonEvent;

/**
 * Instance events.
 */

export type CodeEditorInstanceEvent =
  | CodeEditorChangeEvent
  | CodeEditorChangedEvent
  | CodeEditorActionEvent;

export type CodeEditorChangeEvent =
  | ICodeEditorChangeFocusEvent
  | ICodeEditorChangeSelectionEvent
  | ICodeEditorChangeTextEvent;

export type CodeEditorChangedEvent =
  | ICodeEditorSelectionChangedEvent
  | ICodeEditorFocusChangedEvent
  | ICodeEditorTextChangedEvent;

export type CodeEditorActionEvent = ICodeEditorRunActionEvent | ICodeEditorActionCompleteEvent;

/**
 * Global (Singleton) Events.
 */
export type CodeEditorSingletonEvent = CodeEditorLibsEvent;
export type CodeEditorLibsEvent =
  | ICodeEditorLibsClearEvent
  | ICodeEditorLibsLoadEvent
  | ICodeEditorLibsLoadedEvent;

/**
 * Fired to assign focus to an editor.
 */
export type ICodeEditorChangeFocusEvent = {
  type: 'CodeEditor/change:focus';
  payload: ICodeEditorChangeFocus;
};
export type ICodeEditorChangeFocus = { instance: string };

/**
 * Fired when editor recieves or loses focus.
 */
export type ICodeEditorFocusChangedEvent = {
  type: 'CodeEditor/changed:focus';
  payload: ICodeEditorFocusChanged;
};
export type ICodeEditorFocusChanged = {
  instance: string;
  isFocused: boolean;
};

/**
 * Fired to cause a change to the editor selection.
 */
export type ICodeEditorChangeSelectionEvent = {
  type: 'CodeEditor/change:selection';
  payload: ICodeEditorChangeSelection;
};
export type ICodeEditorChangeSelection = {
  instance: string;
  selection: t.CodeEditorPosition | t.CodeEditorRange | t.CodeEditorRange[] | null;
  focus?: boolean;
};

/**
 * Fired when editor cursor/selection changes.
 */
export type ICodeEditorSelectionChangedEvent = {
  type: 'CodeEditor/changed:selection';
  payload: ICodeEditorSelectionChanged;
};
export type ICodeEditorSelectionChanged = {
  instance: string;
  selection: t.CodeEditorSelection;
  via: 'keyboard' | 'mouse';
};

/**
 * Fired to change the text within an editor.
 */
export type ICodeEditorChangeTextEvent = {
  type: 'CodeEditor/change:text';
  payload: ICodeEditorChangeText;
};
export type ICodeEditorChangeText = {
  instance: string;
  text: string | null;
};

/**
 * Fires when the editor text changes.
 */
export type ICodeEditorTextChangedEvent = {
  type: 'CodeEditor/changed:text';
  payload: ICodeEditorTextChanged;
};
export type ICodeEditorTextChanged = {
  instance: string;
  changes: ICodeEditorTextChange[];
  isFlush: boolean;
  isRedoing: boolean;
  isUndoing: boolean;
};
export type ICodeEditorTextChange = {
  range: t.CodeEditorRange;
  text: string;
};

/**
 * Fires to invoke the given action upon the editor.
 */
export type ICodeEditorRunActionEvent = {
  type: 'CodeEditor/action:run';
  payload: ICodeEditorRunAction;
};
export type ICodeEditorRunAction = {
  instance: string;
  action: t.MonacoAction;
  tx?: string; // Execution id.
};

export type ICodeEditorActionCompleteEvent = {
  type: 'CodeEditor/action:complete';
  payload: ICodeEditorActionComplete;
};
export type ICodeEditorActionComplete = {
  tx: string; // Execution id.
  instance: string;
  action: t.MonacoAction;
  error?: string;
};

/**
 * Type Definition Libraries
 */
export type ICodeEditorLibsClearEvent = {
  type: 'CodeEditor/libs:clear';
  payload: ICodeEditorLibsClear;
};
export type ICodeEditorLibsClear = {
  // todo: exclude pattern (minimatch)
};

export type ICodeEditorLibsLoadEvent = {
  type: 'CodeEditor/libs:load';
  payload: ICodeEditorLibsLoad;
};
export type ICodeEditorLibsLoad = {
  tx: string; // Execution id.
  url: string;
};

export type ICodeEditorLibsLoadedEvent = {
  type: 'CodeEditor/libs:loaded';
  payload: ICodeEditorLibsLoaded;
};
export type ICodeEditorLibsLoaded = {
  tx: string; // Execution id.
  url: string;
  files: string[];
};
