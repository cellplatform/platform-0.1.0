import * as React from 'react';
import { Controlled as CodeMirrorControlled, IInstance } from 'react-codemirror2';
import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { css, events, GlamorValue, is, t, value as valueUtil } from '../../common';

/**
 * For more syntax modes, see:
 * - https://codemirror.net/mode
 */
if (is.browser) {
  require('codemirror/mode/spreadsheet/spreadsheet.js');
}
export type FormulaInputMode = 'spreadsheet';

export interface IFormulaInputProps {
  value?: string;
  mode?: FormulaInputMode;
  fontSize?: number;
  multiline?: boolean;
  allowTab?: boolean;
  focusOnLoad?: boolean;
  selectOnLoad?: boolean;
  maxLength?: number;
  height?: number;
  events$?: Subject<t.FormulaInputEvent>;
  style?: GlamorValue;
}

export interface IFormulaInputState {
  isLoaded?: boolean;
}

/**
 * Color coded formula input.
 */
export class FormulaInput extends React.PureComponent<IFormulaInputProps, IFormulaInputState> {
  /**
   * [Fields]
   */
  public state: IFormulaInputState = { isLoaded: false };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IFormulaInputState>>();

  private editor: CodeMirror.Editor;
  private editorRef = (ref: any) => (this.editor = ref && ref.editor);

  private readonly _events$ = new Subject<t.FormulaInputEvent>();
  public readonly events$ = this._events$.pipe(
    takeUntil(this.unmounted$),
    share(),
  );

  private readonly modifierKeys: t.IModifierKeys = {
    alt: false,
    control: false,
    shift: false,
    meta: false,
  };

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const { events$ } = this.props;

    // Change state safely.
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    // Bubble events to parent.
    if (events$) {
      this.events$.subscribe(e => events$.next(e));
    }

    // Suppress tab key if requested.
    this.events$
      .pipe(
        filter(e => e.type === 'INPUT/formula/tab'),
        filter(e => !valueUtil.defaultValue(this.props.allowTab, true)),
        map(e => e.payload as t.IFormulaInputTab),
      )
      .subscribe(e => e.cancel());

    // Monitor keyboard.
    const keypress$ = events.keyPress$.pipe(takeUntil(this.unmounted$));
    const modifier$ = keypress$.pipe(filter(e => e.isModifier));

    // Keep references to currently pressed modifier keys
    modifier$
      .pipe(
        filter(e => e.isPressed),
        map(e => e.key.toLowerCase()),
      )
      .subscribe(key => (this.modifierKeys[key] = true));
    modifier$
      .pipe(
        filter(e => !e.isPressed),
        map(e => e.key.toLowerCase()),
      )
      .subscribe(key => (this.modifierKeys[key] = false));
  }

  public componentDidMount() {
    this.setState({ isLoaded: true }, () => this.init());
  }

  private init() {
    const { focusOnLoad, selectOnLoad } = this.props;
    if (focusOnLoad) {
      this.focus();
    }
    if (selectOnLoad) {
      this.selectAll();
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get isFocused() {
    return this.editor ? this.editor.hasFocus() : false;
  }

  private get height() {
    const { multiline: isMultiLine = false, height } = this.props;
    if (height !== undefined) {
      return height;
    }
    if (!isMultiLine && height === undefined) {
      return 21;
    }
    return;
  }

  private get className() {
    return `platform-formulaInput-${this.fontSize}`;
  }

  private get fontSize() {
    const { fontSize = 12 } = this.props;
    return fontSize;
  }

  /**
   * [Methods]
   */
  public focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  public redraw() {
    this.forceUpdate();
    if (this.editor) {
      this.editor.refresh();
    }
  }

  public selectAll() {
    this.editor.execCommand('selectAll');
  }

  /**
   * [Render]
   */

  public render() {
    this.setGlobalStyles();
    const { multiline: isMultiLine = false, maxLength, mode = 'spreadsheet' } = this.props;
    const height = this.height;
    const value = formatValue(this.props.value, { maxLength, isMultiLine });
    const styles = {
      base: css({
        height,
        Scroll: isMultiLine,
        overflow: 'hidden',
        lineHeight: 1,
      }),
    };

    const el = this.state.isLoaded && (
      <CodeMirrorControlled
        ref={this.editorRef}
        options={{ mode }}
        value={value}
        onBeforeChange={this.handleBeforeChange}
        onFocus={this.focusHandler(true)}
        onBlur={this.focusHandler(false)}
      />
    );

    return (
      <div className={this.className} {...css(styles.base, this.props.style)}>
        {el}
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private fire = (e: t.FormulaInputEvent) => this._events$.next(e);

  private focusHandler = (isFocused: boolean) => {
    return () => {
      if (isFocused) {
        this.fire({ type: 'INPUT/formula/focus', payload: {} });
      }
      if (!isFocused) {
        this.fire({ type: 'INPUT/formula/blur', payload: {} });
      }
    };
  };

  private handleBeforeChange = (
    editor: IInstance,
    data: CodeMirror.EditorChange,
    value: string,
  ) => {
    const { multiline: isMultiLine = false, maxLength } = this.props;
    const change = data as CodeMirror.EditorChangeCancellable;
    const char = change.text[0];
    const modifierKeys = { ...this.modifierKeys };

    if (char.includes('\t')) {
      let isCancelled = false;
      this.fire({
        type: 'INPUT/formula/tab',
        payload: {
          get isCancelled() {
            return isCancelled;
          },
          cancel() {
            isCancelled = true;
          },
          modifierKeys,
        },
      });
      if (isCancelled) {
        return;
      }
    }

    if (!isMultiLine) {
      const wasCancelled = singleLineOnly(change);
      if (wasCancelled) {
        return; // No need to continue - a new-line request was cancelled.
      }
    }

    if (isNewLine(change)) {
      let isCancelled = false;
      this.fire({
        type: 'INPUT/formula/newLine',
        payload: {
          get isCancelled() {
            return isCancelled;
          },
          cancel() {
            isCancelled = true;
          },
          modifierKeys,
        },
      });
      if (isCancelled) {
        return; // No need to continue - a new-line request was cancelled.
      }
    }

    // Fire BEFORE event.
    const from = this.props.value || '';
    const to = value;
    const isMax = maxLength === undefined ? null : to.length === maxLength;
    let isChangeCancelled = false;
    const changedPayload: t.IFormulaInputChanged = { from, to, isMax, char, modifierKeys };
    const changingPayload: t.IFormulaInputChanging = {
      ...changedPayload,
      get isCancelled() {
        return isChangeCancelled;
      },
      cancel() {
        isChangeCancelled = true;
      },
    };
    this.fire({ type: 'INPUT/formula/changing', payload: changingPayload });
    if (isChangeCancelled) {
      return; // A listener cancelled the change.
    }

    // Apply the change to the editor.
    if (maxLength !== undefined) {
      const clippedValue = formatValue(value, { maxLength, isMultiLine });
      if (clippedValue !== value) {
        if (change.update && change.origin === '+input') {
          change.update(undefined, undefined, [clippedValue]);
          value = clippedValue;
        }
      }
    }

    // Fire AFTER event.
    this.fire({ type: 'INPUT/formula/changed', payload: changedPayload });
  };

  private setGlobalStyles() {
    const style = {
      '.CodeMirror': { fontSize: this.fontSize },
    };
    const prefix = `.${this.className}`;
    css.global(style, { prefix });
    console.log('prefix', prefix);
  }
}

/**
 * [Helpers]
 */
function singleLineOnly(change: CodeMirror.EditorChangeCancellable) {
  if (isNewLine(change)) {
    return change.cancel();
  }

  const pastedNewLine =
    change.origin === 'paste' && typeof change.text === 'object' && change.text.length > 1;
  if (pastedNewLine && change.update) {
    const newText = change.text.join(' ');
    return change.update(undefined, undefined, [newText]);
  }

  return null;
}

function isNewLine(change: CodeMirror.EditorChange) {
  // Supress new lines characters.
  // Source: https://discuss.codemirror.net/t/single-line-codemirror/195/3
  return (
    change.origin === '+input' && typeof change.text === 'object' && change.text.join('') === ''
  );
}

function formatValue(
  value: string | undefined,
  options: { maxLength?: number; isMultiLine?: boolean },
) {
  const { maxLength, isMultiLine = false } = options;
  value = value || '';

  // No new-line characters.
  if (!isMultiLine) {
    value = value.replace(/\n/g, '');
  }

  // Max-length.
  if (maxLength !== undefined && value.length > maxLength) {
    value = value.substr(0, maxLength);
  }
  return value;
}
