import { t } from './common';

type Id = string;
type Milliseconds = number;

export type CodeEditorEventBus = t.EventBus<t.CodeEditorEvent>;
export type CodeEditorEvent = CodeEditorInstanceEvent | CodeEditorSingletonEvent;

/**
 * Instance events.
 */

export type CodeEditorInstanceEvent =
  | CodeEditorFocusEvent
  | CodeEditorChangeSelectionEvent
  | CodeEditorChangeTextEvent
  | CodeEditorTextReqEvent
  | CodeEditorTextResEvent
  | CodeEditorSelectionChangedEvent
  | CodeEditorFocusedEvent
  | CodeEditorTextChangedEvent
  | CodeEditorRunActionReqEvent
  | CodeEditorRunActionResEvent
  | CodeEditorModelReqEvent
  | CodeEditorModelResEvent;

/**
 * Global (Singleton) Events.
 */
export type CodeEditorSingletonEvent =
  | CodeEditorInitReqEvent
  | CodeEditorInitResEvent
  | CodeEditorStatusReqEvent
  | CodeEditorStatusResEvent
  | CodeEditorLibsEvent;

export type CodeEditorLibsEvent =
  | CodeEditorLibsClearReqEvent
  | CodeEditorLibsClearResEvent
  | CodeEditorLibsLoadReqEvent
  | CodeEditorLibsLoadResEvent;

/**
 * Initialize the CodeEditor environment.
 */
export type CodeEditorInitReqEvent = {
  type: 'sys.ui.code/init:req';
  payload: CodeEditorInitReq;
};
export type CodeEditorInitReq = { tx: string; staticRoot?: string };

export type CodeEditorInitResEvent = {
  type: 'sys.ui.code/init:res';
  payload: CodeEditorInitRes;
};
export type CodeEditorInitRes = { tx: string; info?: t.CodeEditorStatus; error?: string };

/**
 * Status information about the CodeEditor (and the environment).
 */
export type CodeEditorStatusReqEvent = {
  type: 'sys.ui.code/status:req';
  payload: CodeEditorStatusReq;
};
export type CodeEditorStatusReq = { tx: string };

export type CodeEditorStatusResEvent = {
  type: 'sys.ui.code/status:res';
  payload: CodeEditorStatusRes;
};
export type CodeEditorStatusRes = { tx: string; info?: t.CodeEditorStatus; error?: string };

/**
 * Fired to assign focus to an editor.
 */
export type CodeEditorFocusEvent = {
  type: 'sys.ui.code/focus';
  payload: CodeEditorFocus;
};
export type CodeEditorFocus = { instance: Id };

/**
 * Fired when editor recieves or loses focus.
 */
export type CodeEditorFocusedEvent = {
  type: 'sys.ui.code/focused';
  payload: CodeEditorFocused;
};
export type CodeEditorFocused = {
  instance: Id;
  isFocused: boolean;
};

/**
 * Fired to cause a change to the editor selection.
 */
export type CodeEditorChangeSelectionEvent = {
  type: 'sys.ui.code/change:selection';
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
  type: 'sys.ui.code/changed:selection';
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
  type: 'sys.ui.code/change:text';
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
  type: 'sys.ui.code/text:req';
  payload: CodeEditorTextReq;
};
export type CodeEditorTextReq = { tx: string; instance: Id };

export type CodeEditorTextResEvent = {
  type: 'sys.ui.code/text:res';
  payload: CodeEditorTextRes;
};
export type CodeEditorTextRes = { tx: string; instance: Id; text: string };

/**
 * Fires when the editor text changes.
 */
export type CodeEditorTextChangedEvent = {
  type: 'sys.ui.code/changed:text';
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
  type: 'sys.ui.code/action:req';
  payload: CodeEditorRunActionReq;
};
export type CodeEditorRunActionReq = {
  tx: string;
  instance: Id;
  action: t.MonacoAction;
};

export type CodeEditorRunActionResEvent = {
  type: 'sys.ui.code/action:res';
  payload: CodeEditorRunActionRes;
};
export type CodeEditorRunActionRes = {
  tx: string;
  instance: Id;
  elapsed: Milliseconds;
  action?: t.MonacoAction;
  error?: string;
};

/**
 * Type Definition Libraries
 */
export type CodeEditorLibsClearReqEvent = {
  type: 'sys.ui.code/libs/clear:req';
  payload: CodeEditorLibsClearReq;
};
export type CodeEditorLibsClearReq = {
  tx: string;
  /**
   * TODO 🐷 - exclude pattern (minimatch)
   */
};

export type CodeEditorLibsClearResEvent = {
  type: 'sys.ui.code/libs/clear:res';
  payload: CodeEditorLibsClearRes;
};
export type CodeEditorLibsClearRes = { tx: string; error?: string };

export type CodeEditorLibsLoadReqEvent = {
  type: 'sys.ui.code/libs/load:req';
  payload: CodeEditorLibsLoadReq;
};
export type CodeEditorLibsLoadReq = { tx: string; url: string };

export type CodeEditorLibsLoadResEvent = {
  type: 'sys.ui.code/libs/load:res';
  payload: CodeEditorLibsLoadRes;
};
export type CodeEditorLibsLoadRes = { tx: string; url: string; files: string[]; error?: string };

/**
 * Code Editor Model
 */
export type CodeEditorModelReqEvent = {
  type: 'sys.ui.code/model:req';
  payload: CodeEditorModelReq;
};
export type CodeEditorModelReq = {
  tx: string;
  instance: Id;
  change?: Partial<t.CodeEditorModel>;
};

export type CodeEditorModelResEvent = {
  type: 'sys.ui.code/model:res';
  payload: CodeEditorModelRes;
};
export type CodeEditorModelRes = {
  tx: string;
  instance: Id;
  action: 'read' | 'update';
  model: t.CodeEditorModel;
};
