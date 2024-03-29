import { t } from './common';

type Id = string;
type Milliseconds = number;

export type CodeEditorEventBus = t.EventBus<t.CodeEditorEvent>;
export type CodeEditorEvent = CodeEditorInstanceEvent | CodeEditorSingletonEvent;

/**
 * CodeEditor: Global (Singleton) Events.
 */
export type CodeEditorSingletonEvent =
  | CodeEditorGlobalInitReqEvent
  | CodeEditorGlobalInitResEvent
  | CodeEditorGlobalStatusReqEvent
  | CodeEditorGlobalStatusResEvent
  | CodeEditorGlobalStatusUpdatedEvent
  | CodeEditorLibsEvent;

export type CodeEditorLibsEvent =
  | CodeEditorLibsClearReqEvent
  | CodeEditorLibsClearResEvent
  | CodeEditorLibsLoadReqEvent
  | CodeEditorLibsLoadResEvent;

/**
 * CodeEditor: Instance events.
 */
export type CodeEditorInstanceEvent =
  | CodeEditorStatusUpdateEvent
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
 * Initialize the CodeEditor environment.
 */
export type CodeEditorGlobalInitReqEvent = {
  type: 'sys.ui.code/init:req';
  payload: CodeEditorGlobalInitReq;
};
export type CodeEditorGlobalInitReq = { tx: string; staticRoot?: string };

export type CodeEditorGlobalInitResEvent = {
  type: 'sys.ui.code/init:res';
  payload: CodeEditorGlobalInitRes;
};
export type CodeEditorGlobalInitRes = { tx: string; info?: t.CodeEditorStatus; error?: string };

/**
 * Status information about the CodeEditor (and the environment).
 */
export type CodeEditorGlobalStatusReqEvent = {
  type: 'sys.ui.code/status.g:req';
  payload: CodeEditorGlobalStatusReq;
};
export type CodeEditorGlobalStatusReq = { tx: string };

export type CodeEditorGlobalStatusResEvent = {
  type: 'sys.ui.code/status.g:res';
  payload: CodeEditorGlobalStatusRes;
};
export type CodeEditorGlobalStatusRes = { tx: string; info?: t.CodeEditorStatus; error?: string };

export type CodeEditorGlobalStatusUpdatedEvent = {
  type: 'sys.ui.code/status.g:updated';
  payload: CodeEditorGlobalStatusUpdated;
};
export type CodeEditorGlobalStatusUpdated = {
  instance?: Id;
};

/**
 * Broadcast "instance" status updates.
 */
export type CodeEditorStatusUpdateEvent = {
  type: 'sys.ui.code/status:update';
  payload: CodeEditorStatusUpdate;
};
export type CodeEditorStatusUpdate = {
  instance: Id;
  action: 'Lifecycle:Start' | 'Lifecycle:End';
  info: t.CodeEditorInstanceStatus;
};

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
