/**
 * https://microsoft.github.io/monaco-editor/api/enums/monaco.editor.endoflinepreference.html
 */
export enum IMonacoEndOfLinePreference {
  TextDefined = 0,
  LF = 1,
  CRLF = 2,
}

/**
 * https://microsoft.github.io/monaco-editor/api/enums/monaco.editor.endoflinesequence.html
 */
export enum IMonacoEndOfLineSequence {
  LF = 0,
  CRLF = 1,
}

/**
 * Describes the reason the cursor has changed its position.
 * https://microsoft.github.io/monaco-editor/api/enums/monaco.editor.cursorchangereason.html
 */
export enum IMonacoCursorChangeReason {
  /**
   * Unknown or not set.
   */
  NotSet = 0,
  /**
   * A `model.setValue()` was called.
   */
  ContentFlush = 1,
  /**
   * The `model` has been changed outside of this cursor and the cursor recovers its position from associated markers.
   */
  RecoverFromMarkers = 2,
  /**
   * There was an explicit user gesture.
   */
  Explicit = 3,
  /**
   * There was a Paste.
   */
  Paste = 4,
  /**
   * There was an Undo.
   */
  Undo = 5,
  /**
   * There was a Redo.
   */
  Redo = 6,
}
