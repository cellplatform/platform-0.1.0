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
  | CodeEditorChangeFocusEvent
  | CodeEditorChangeSelectionEvent
  | CodeEditorChangeTextEvent;

export type CodeEditorChangedEvent =
  | CodeEditorSelectionChangedEvent
  | CodeEditorFocusChangedEvent
  | CodeEditorTextChangedEvent;

export type CodeEditorActionEvent = CodeEditorRunActionEvent | CodeEditorActionCompleteEvent;

/**
 * Global (Singleton) Events.
 */
export type CodeEditorSingletonEvent = CodeEditorLibsEvent;
export type CodeEditorLibsEvent =
  | CodeEditorLibsClearEvent
  | CodeEditorLibsLoadEvent
  | CodeEditorLibsLoadedEvent;

/**
 * Fired to assign focus to an editor.
 */
export type CodeEditorChangeFocusEvent = {
  type: 'CodeEditor/change:focus';
  payload: CodeEditorChangeFocus;
};
export type CodeEditorChangeFocus = { instance: string };

/**
 * Fired when editor recieves or loses focus.
 */
export type CodeEditorFocusChangedEvent = {
  type: 'CodeEditor/changed:focus';
  payload: CodeEditorFocusChanged;
};
export type CodeEditorFocusChanged = {
  instance: string;
  isFocused: boolean;
};

/**
 * Fired to cause a change to the editor selection.
 */
export type CodeEditorChangeSelectionEvent = {
  type: 'CodeEditor/change:selection';
  payload: CodeEditorChangeSelection;
};
export type CodeEditorChangeSelection = {
  instance: string;
  selection: t.CodeEditorPosition | t.CodeEditorRange | t.CodeEditorRange[] | null;
  focus?: boolean;
};

/**
 * Fired when editor cursor/selection changes.
 */
export type CodeEditorSelectionChangedEvent = {
  type: 'CodeEditor/changed:selection';
  payload: CodeEditorSelectionChanged;
};
export type CodeEditorSelectionChanged = {
  instance: string;
  selection: t.CodeEditorSelection;
  via: 'keyboard' | 'mouse';
};

/**
 * Fired to change the text within an editor.
 */
export type CodeEditorChangeTextEvent = {
  type: 'CodeEditor/change:text';
  payload: CodeEditorChangeText;
};
export type CodeEditorChangeText = {
  instance: string;
  text: string | null;
};

/**
 * Fires when the editor text changes.
 */
export type CodeEditorTextChangedEvent = {
  type: 'CodeEditor/changed:text';
  payload: CodeEditorTextChanged;
};
export type CodeEditorTextChanged = {
  instance: string;
  changes: CodeEditorTextChange[];
  isFlush: boolean;
  isRedoing: boolean;
  isUndoing: boolean;
};
export type CodeEditorTextChange = {
  range: t.CodeEditorRange;
  text: string;
};

/**
 * Fires to invoke the given action upon the editor.
 */
export type CodeEditorRunActionEvent = {
  type: 'CodeEditor/action:run';
  payload: CodeEditorRunAction;
};
export type CodeEditorRunAction = {
  instance: string;
  action: t.MonacoAction;
  tx?: string;
};

export type CodeEditorActionCompleteEvent = {
  type: 'CodeEditor/action:complete';
  payload: CodeEditorActionComplete;
};
export type CodeEditorActionComplete = {
  tx: string;
  instance: string;
  action: t.MonacoAction;
  error?: string;
};

/**
 * Type Definition Libraries
 */
export type CodeEditorLibsClearEvent = {
  type: 'CodeEditor/libs:clear';
  payload: CodeEditorLibsClear;
};
export type CodeEditorLibsClear = {
  // todo: exclude pattern (minimatch)
};

export type CodeEditorLibsLoadEvent = {
  type: 'CodeEditor/libs:load';
  payload: CodeEditorLibsLoad;
};
export type CodeEditorLibsLoad = { tx: string; url: string };

export type CodeEditorLibsLoadedEvent = {
  type: 'CodeEditor/libs:loaded';
  payload: CodeEditorLibsLoaded;
};
export type CodeEditorLibsLoaded = { tx: string; url: string; files: string[] };
