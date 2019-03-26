import '../../styles';

import * as React from 'react';
import { Controlled as CodeMirrorControlled, IInstance } from 'react-codemirror2';
import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import { css, GlamorValue, is, t, time } from '../../common';

if (is.browser) {
  require('codemirror/mode/mathematica/mathematica.js');
  require('codemirror/mode/javascript/javascript.js');
}

export interface IFormulaInputProps {
  value?: string;
  mode?: 'mathematica' | 'javascript';
  isMultiLine?: boolean;
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

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const { events$ } = this.props;
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    if (events$) {
      this.events$.subscribe(e => events$.next(e));
    }
  }

  public componentDidMount() {
    const { focusOnLoad, selectOnLoad } = this.props;
    time.delay(0, () => {
      this.setState({ isLoaded: true }, () => {
        if (focusOnLoad) {
          this.focus();
        }
        if (selectOnLoad) {
          this.selectAll();
        }
      });
    });
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
    const { isMultiLine = false, height } = this.props;
    if (height !== undefined) {
      return height;
    }
    if (!isMultiLine && height === undefined) {
      return 21;
    }
    return;
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
    const { isMultiLine = false, maxLength, mode = 'mathematica' } = this.props;
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
      <div className={'FormulaInput'} {...css(styles.base, this.props.style)}>
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
    const { isMultiLine = false, maxLength } = this.props;
    const change = data as CodeMirror.EditorChangeCancellable;
    const char = change.text[0];

    if (char.includes('\t')) {
      let isCancelled = false;
      this.fire({
        type: 'INPUT/formula/tab',
        payload: {
          cancel: () => (isCancelled = true),
          get isCancelled() {
            return isCancelled;
          },
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

    if (maxLength !== undefined) {
      const clippedValue = formatValue(value, { maxLength, isMultiLine });
      if (clippedValue !== value) {
        if (change.update && change.origin === '+input') {
          change.update(undefined, undefined, [clippedValue]);
          value = clippedValue;
        }
      }
    }

    // Alert listeners.
    const from = this.props.value || '';
    const to = value;
    const isMax = maxLength === undefined ? null : to.length === maxLength;
    this.fire({ type: 'INPUT/formula/change', payload: { from, to, isMax, char } });
  };
}

/**
 * [Helpers]
 */
function singleLineOnly(change: CodeMirror.EditorChangeCancellable) {
  // Supress new lines characters.
  // Source: https://discuss.codemirror.net/t/single-line-codemirror/195/3
  const typedNewLine =
    change.origin === '+input' && typeof change.text === 'object' && change.text.join('') === '';

  if (typedNewLine) {
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
