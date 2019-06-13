import * as styles from '../../styles';

import * as commands from 'prosemirror-commands';
import { EditorState, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import {
  constants,
  containsFocus,
  events,
  GlamorValue,
  css,
  IEditorStyles,
  markdown,
  value,
} from '../../common';
import * as plugins from './plugins';
import * as t from './types';

const CLASS = constants.CSS.CLASS;

export type DocSchema = any;

export type ITextEditorProps = {
  value?: string;
  format?: 'MARKDOWN';
  events$?: Subject<t.TextEditorEvent>;
  focusOnLoad?: boolean;
  selectAllOnLoad?: boolean;
  cursorToEndOnLoad?: boolean;
  className?: string;
  style?: GlamorValue;
  editorStyle?: GlamorValue;
  contentStyle?: Partial<IEditorStyles>;
  fontSize?: number | string;

  allowEnter?: boolean;
  allowMetaEnter?: boolean;
  allowHeadings?: boolean;
};

/**
 * A prose-mirror editor.
 *
 * See:
 *  - https://prosemirror.net/docs/guide
 *  - https://prosemirror.net/examples/markdown
 *  - https://github.com/ProseMirror/prosemirror-example-setup/blob/master/README.md
 *
 */
export class TextEditor extends React.PureComponent<ITextEditorProps> {
  /**
   * [Static]
   */
  public static markdown = markdown;

  public static size(el?: HTMLElement): t.IEditorSize {
    const width = el ? el.offsetWidth : -1;
    const height = el ? el.offsetHeight : -1;
    return { width, height };
  }

  /**
   * [Fields]
   */
  private elBlurTarget!: HTMLDivElement;
  private elBlurTargetRef = (ref: HTMLDivElement) => (this.elBlurTarget = ref);

  private elEditor: HTMLDivElement;
  private elEditorRef = (ref: HTMLDivElement) => (this.elEditor = ref);

  private elMeasure: HTMLDivElement;
  private elMeasureRef = (ref: HTMLDivElement) => (this.elMeasure = ref);

  private view: EditorView;
  private viewMeasure: EditorView;

  private _prevState: t.EditorState | undefined;
  private _prevSize: t.IEditorSize = { width: -1, height: -1 };

  private unmounted$ = new Subject<{}>();
  private keypress$ = events.keyPress$.pipe(takeUntil(this.unmounted$));

  private _events$ = new Subject<t.TextEditorEvent>();
  public events$ = this._events$.pipe(takeUntil(this.unmounted$));

  private readonly modifierKeys: t.ITextEditorModifierKeys = {
    alt: false,
    control: false,
    shift: false,
    meta: false,
  };

  /**
   * [Constructor]
   */

  public componentWillMount() {
    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
    }

    // Monitor keyboard.
    const keypress$ = this.keypress$;
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
    const {
      value = '',
      focusOnLoad,
      selectAllOnLoad,
      cursorToEndOnLoad: caretToEndOnLoad,
    } = this.props;
    this.init(value);
    if (selectAllOnLoad) {
      this.selectAll();
    }
    if (caretToEndOnLoad) {
      this.cursorToEnd();
    }
    if (focusOnLoad) {
      this.focus();
    }
  }

  public componentDidUpdate(prev: ITextEditorProps) {
    const { value = '' } = this.props;
    if (prev.value !== value) {
      if (value !== this.value) {
        this.load(value);
      }
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
    this.view.destroy();
  }

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this.unmounted$.complete;
  }

  public get isFocused() {
    return containsFocus(this.elEditor) || this.view.hasFocus();
  }

  public get value() {
    return markdown.serialize(this.view.state);
  }

  public get editor() {
    const view = this.view;
    const state = view.state;
    return { view, state };
  }

  public get size(): t.IEditorSize {
    return TextEditor.size(this.elEditor);
  }

  /**
   * [Methods]
   */

  /**
   * Initializes the PromiseMirror editor component.
   */
  public init(value: string) {
    if (this.view) {
      this.view.destroy();
    }
    const state = EditorState.create({
      doc: markdown.parse(value),
      plugins: plugins.init({
        events$: this._events$,
        schema: markdown.schema,
        allowEnter: this.props.allowEnter,
        allowMetaEnter: this.props.allowMetaEnter,
        allowHeadings: this.props.allowHeadings,
      }),
    });

    const dispatchTransaction = this.dispatch;

    this.view = new EditorView<DocSchema>(this.elEditor, {
      state,
      dispatchTransaction,
    });

    this.viewMeasure = new EditorView<DocSchema>(this.elMeasure, {
      state,
      dispatchTransaction,
    });
  }

  /**
   * Loads the given markdown document (replacing any existing content).
   */
  public load(value: string) {
    const { state } = this.editor;
    const node = markdown.parse(value);
    const tr = state.tr;
    tr.replaceWith(0, tr.doc.content.size, node);
    this.dispatch(tr);
  }

  /**
   * Assigns focus to the editor.
   */
  public focus(isFocused?: boolean) {
    const { view } = this.editor;
    isFocused = value.defaultValue(isFocused, true);
    if (isFocused) {
      if (view) {
        view.focus();
      }
    } else {
      if (this.elBlurTarget) {
        this.elBlurTarget.focus();
        this.elBlurTarget.blur();
      }
    }
    return this;
  }

  /**
   * Removes focus from the editor.
   */
  public blur() {
    return this.focus(false);
  }

  public selectAll() {
    const { state } = this.editor;
    commands.selectAll(state, this.dispatch);
    return this;
  }

  public cursorToStart() {
    const { view } = this.editor;
    if (view) {
      const tr = view.state.tr;
      const selection = TextSelection.atStart(tr.doc);
      view.dispatch(tr.setSelection(selection));
    }
    return this;
  }

  public cursorToEnd() {
    const { view } = this.editor;
    if (view) {
      const tr = view.state.tr;
      const selection = TextSelection.atEnd(tr.doc);
      view.dispatch(tr.setSelection(selection));
    }
    return this;
  }

  private updateStyles() {
    const { contentStyle, className } = this.props;
    if (contentStyle) {
      styles.init({ styles: contentStyle, className });
    }
  }

  /**
   * [Render]
   */
  public render() {
    this.updateStyles();
    const className = `${CLASS.EDITOR} ${this.props.className || ''}`.trim();
    const { fontSize = 16 } = this.props;
    const styles = {
      base: css({
        fontSize,
        boxSizing: 'border-box',
      }),
      editorOuter: css({
        overflow: 'hidden', // NB: Prevent margin collapsing. https://stackoverflow.com/questions/19718634/how-to-disable-margin-collapsing
      }),
      measureOuter: css({
        Absolute: 0,
        visibility: 'hidden',
      }),
      blurTarget: css({
        /**
         * HACK:  This element exists as a hack to properly blur focus
         *        away from the editor on `focus(false)`.
         */
        width: 0,
        height: 0,
        overflow: 'hidden',
        opacity: 0,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)} onClick={this.handleClick}>
        <div ref={this.elBlurTargetRef} tabIndex={-1} {...styles.blurTarget} />

        <div className={className} {...css(this.props.editorStyle, styles.editorOuter)}>
          <div
            ref={this.elEditorRef}
            onKeyDown={this.handleKeyDown as any}
            onFocus={this.handleFocus(true)}
            onBlur={this.handleFocus(false)}
          />
        </div>
        {/*
            NOTE: The element below is turned into a second "hidden" editor which is
                  used to measure the size of the rendered content prior to the main
                  visible editor being updated.
                  This data is fired through the "changing/pre" event.
          */}
        <div
          className={className}
          {...css(this.props.editorStyle, styles.editorOuter, styles.measureOuter)}
        >
          <div ref={this.elMeasureRef} />
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private handleFocus = (isFocused: boolean) => {
    return () => {
      this.fire({ type: 'EDITOR/focus', payload: { isFocused } });
    };
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    let isCancelled = false;
    this.fire({
      type: 'EDITOR/keydown',
      payload: {
        event: events.toKeypress(e, false),
        get isCancelled() {
          return isCancelled;
        },
        cancel() {
          isCancelled = true;
          e.preventDefault();
          e.stopPropagation();
        },
      },
    });
  };

  private dispatch = (transaction: t.Transaction<DocSchema>) => {
    const view = this.view;
    const self = this; // tslint:disable-line

    // NB: Some transaction just move the cursor around etc.
    //     Only fire change events for actual doc changes.
    const isDocChanged = transaction.docChanged;

    const state = {
      from: view.state,
      to: view.state.apply(transaction),
    };

    const value = {
      get from() {
        return markdown.serialize(state.from);
      },
      get to() {
        return markdown.serialize(state.to);
      },
    };

    let toSize: t.IEditorSize | undefined;
    const size = {
      from: this._prevSize,
      get to() {
        if (!toSize) {
          self.viewMeasure.updateState(state.to);
          toSize = TextEditor.size(self.elMeasure);
        }
        return toSize;
      },
    };

    // Fire the BEFORE event.
    let isCancelled = false;
    if (isDocChanged) {
      const modifierKeys = { ...this.modifierKeys };
      this.fire({
        type: 'EDITOR/changing',
        payload: {
          transaction,
          state,
          value,
          modifierKeys,
          size,
          get isCancelled() {
            return isCancelled;
          },
          cancel() {
            isCancelled = true;
          },
        },
      });
    }
    if (isCancelled) {
      return;
    }

    // Update the state of the editor.
    view.updateState(state.to);
    if (!toSize) {
      // NB: Short-circuit if state already updated by `size.to` getter.
      this.viewMeasure.updateState(state.to);
    }

    // Fire the AFTER event.
    if (isDocChanged) {
      this.fireChanged();
    }
  };

  private fire(e: t.TextEditorEvent) {
    this._events$.next(e);
  }

  private fireChanged() {
    const modifierKeys = { ...this.modifierKeys };
    const size = { from: this._prevSize, to: this.size };
    const state = {
      from: this._prevState,
      to: this.view.state,
    };

    const value = {
      get from() {
        return state.from ? markdown.serialize(state.from) : '';
      },
      get to() {
        return markdown.serialize(state.to);
      },
    };

    this.fire({
      type: 'EDITOR/changed',
      payload: {
        state,
        value,
        modifierKeys,
        size,
      },
    });

    // Store state as "prev" for next event.
    this._prevState = state.to;
    this._prevSize = size.to;
  }

  private handleClick = () => this.focus();
}
