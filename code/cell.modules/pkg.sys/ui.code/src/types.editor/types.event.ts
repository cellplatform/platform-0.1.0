import { t } from './common';

type InstanceId = string;
export type CodeEditorEventBus = t.EventBus<t.CodeEditorEvent>;
export type CodeEditorEvent = CodeEditorInstanceEvent | CodeEditorSingletonEvent;

/**
 * Instance events.
 */

export type CodeEditorInstanceEvent =
  | CodeEditorChangeFocusEvent
  | CodeEditorChangeSelectionEvent
  | CodeEditorChangeTextEvent
  | CodeEditorTextReqEvent
  | CodeEditorTextResEvent
  | CodeEditorSelectionChangedEvent
  | CodeEditorFocusChangedEvent
  | CodeEditorTextChangedEvent
  | CodeEditorRunActionEvent
  | CodeEditorActionCompleteEvent
  | CodeEditorModelReqEvent
  | CodeEditorModelResEvent;

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
export type CodeEditorChangeFocus = { instance: InstanceId };

/**
 * Fired when editor recieves or loses focus.
 */
export type CodeEditorFocusChangedEvent = {
  type: 'CodeEditor/changed:focus';
  payload: CodeEditorFocusChanged;
};
export type CodeEditorFocusChanged = {
  instance: InstanceId;
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
  instance: InstanceId;
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
  instance: InstanceId;
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
  instance: InstanceId;
  text: string | null;
};

/**
 * Retrieve current editor text.
 */
export type CodeEditorTextReqEvent = {
  type: 'CodeEditor/text:req';
  payload: CodeEditorTextReq;
};
export type CodeEditorTextReq = { tx: string; instance: InstanceId };

export type CodeEditorTextResEvent = {
  type: 'CodeEditor/text:res';
  payload: CodeEditorTextRes;
};
export type CodeEditorTextRes = { tx: string; instance: InstanceId; text: string };

/**
 * Fires when the editor text changes.
 */
export type CodeEditorTextChangedEvent = {
  type: 'CodeEditor/changed:text';
  payload: CodeEditorTextChanged;
};
export type CodeEditorTextChanged = {
  instance: InstanceId;
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
  instance: InstanceId;
  action: t.MonacoAction;
  tx?: string;
};

export type CodeEditorActionCompleteEvent = {
  type: 'CodeEditor/action:complete';
  payload: CodeEditorActionComplete;
};
export type CodeEditorActionComplete = {
  tx: string;
  instance: InstanceId;
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

/**
 * Code Editor Model
 */
export type CodeEditorModelReqEvent = {
  type: 'CodeEditor/model:req';
  payload: CodeEditorModelReq;
};
export type CodeEditorModelReq = {
  tx: string;
  instance: InstanceId;
  change?: Partial<t.CodeEditorModel>;
};

export type CodeEditorModelResEvent = {
  type: 'CodeEditor/model:res';
  payload: CodeEditorModelRes;
};
export type CodeEditorModelRes = {
  tx: string;
  instance: InstanceId;
  action: 'read' | 'update';
  model: t.CodeEditorModel;
};
