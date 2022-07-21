import { t } from './common';

type Id = string;
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
  | CodeEditorRunActionReqEvent
  | CodeEditorRunActionResEvent
  | CodeEditorModelReqEvent
  | CodeEditorModelResEvent;

/**
 * Global (Singleton) Events.
 */
export type CodeEditorSingletonEvent = CodeEditorLibsEvent;
export type CodeEditorLibsEvent =
  | CodeEditorLibsClearReqEvent
  | CodeEditorLibsClearResEvent
  | CodeEditorLibsLoadReqEvent
  | CodeEditorLibsLoadResEvent;

/**
 * Fired to assign focus to an editor.
 */
export type CodeEditorChangeFocusEvent = {
  type: 'CodeEditor/change:focus';
  payload: CodeEditorChangeFocus;
};
export type CodeEditorChangeFocus = { instance: Id };

/**
 * Fired when editor recieves or loses focus.
 */
export type CodeEditorFocusChangedEvent = {
  type: 'CodeEditor/changed:focus';
  payload: CodeEditorFocusChanged;
};
export type CodeEditorFocusChanged = {
  instance: Id;
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
  instance: Id;
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
  instance: Id;
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
  instance: Id;
  text: string | null;
};

/**
 * Retrieve current editor text.
 */
export type CodeEditorTextReqEvent = {
  type: 'CodeEditor/text:req';
  payload: CodeEditorTextReq;
};
export type CodeEditorTextReq = { tx: string; instance: Id };

export type CodeEditorTextResEvent = {
  type: 'CodeEditor/text:res';
  payload: CodeEditorTextRes;
};
export type CodeEditorTextRes = { tx: string; instance: Id; text: string };

/**
 * Fires when the editor text changes.
 */
export type CodeEditorTextChangedEvent = {
  type: 'CodeEditor/changed:text';
  payload: CodeEditorTextChanged;
};
export type CodeEditorTextChanged = {
  instance: Id;
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
export type CodeEditorRunActionReqEvent = {
  type: 'CodeEditor/action:req';
  payload: CodeEditorRunActionReq;
};
export type CodeEditorRunActionReq = {
  tx: string;
  instance: Id;
  action: t.MonacoAction;
};

export type CodeEditorRunActionResEvent = {
  type: 'CodeEditor/action:res';
  payload: CodeEditorRunActionRes;
};
export type CodeEditorRunActionRes = {
  tx: string;
  instance: Id;
  action?: t.MonacoAction;
  error?: string;
};

/**
 * Type Definition Libraries
 */
export type CodeEditorLibsClearReqEvent = {
  type: 'CodeEditor/libs/clear:req';
  payload: CodeEditorLibsClearReq;
};
export type CodeEditorLibsClearReq = {
  tx: string;
  // todo: exclude pattern (minimatch)
};

export type CodeEditorLibsClearResEvent = {
  type: 'CodeEditor/libs/clear:res';
  payload: CodeEditorLibsClearRes;
};
export type CodeEditorLibsClearRes = { tx: string; error?: string };

export type CodeEditorLibsLoadReqEvent = {
  type: 'CodeEditor/libs/load:req';
  payload: CodeEditorLibsLoadReq;
};
export type CodeEditorLibsLoadReq = { tx: string; url: string };

export type CodeEditorLibsLoadResEvent = {
  type: 'CodeEditor/libs/load:res';
  payload: CodeEditorLibsLoadRes;
};
export type CodeEditorLibsLoadRes = { tx: string; url: string; files: string[]; error?: string };

/**
 * Code Editor Model
 */
export type CodeEditorModelReqEvent = {
  type: 'CodeEditor/model:req';
  payload: CodeEditorModelReq;
};
export type CodeEditorModelReq = {
  tx: string;
  instance: Id;
  change?: Partial<t.CodeEditorModel>;
};

export type CodeEditorModelResEvent = {
  type: 'CodeEditor/model:res';
  payload: CodeEditorModelRes;
};
export type CodeEditorModelRes = {
  tx: string;
  instance: Id;
  action: 'read' | 'update';
  model: t.CodeEditorModel;
};
