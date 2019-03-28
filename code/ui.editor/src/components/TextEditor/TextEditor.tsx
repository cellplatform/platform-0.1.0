import '../../styles';

import { defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter, map } from 'rxjs/operators';
import * as commands from 'prosemirror-commands';

import { css, GlamorValue, containsFocus, constants, events } from '../../common';
import * as t from './types';

// @ts-ignore
const exampleSetup = require('prosemirror-example-setup').exampleSetup;
const schema = require('prosemirror-markdown').schema;

export type DocSchema = any;

export type ITextEditorProps = {
  value?: string;
  events$?: Subject<t.TextEditorEvent>;
  focusOnLoad?: boolean;
  selectOnLoad?: boolean;
  style?: GlamorValue;
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
  public static serialize(state: t.EditorState) {
    return defaultMarkdownSerializer.serialize(state.doc);
  }

  /**
   * [Fields]
   */
  private el: HTMLDivElement;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);
  private view: EditorView;
  private _prevState: t.EditorState | undefined;

  private unmounted$ = new Subject();
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
    const { focusOnLoad, selectOnLoad, value = '' } = this.props;
    this.init(value);
    if (focusOnLoad) {
      this.focus({ selectAll: selectOnLoad });
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
    return containsFocus(this.el) || this.view.hasFocus();
  }

  public get value() {
    return TextEditor.serialize(this.view.state);
  }

  public get editor() {
    const view = this.view;
    const state = view.state;
    return { view, state };
  }

  public get width() {
    return this.el ? this.el.offsetWidth : -1;
  }
  public get height() {
    return this.el ? this.el.offsetHeight : -1;
  }
  public get size() {
    return { width: this.width, height: this.height };
  }

  /**
   * [Methods]
   */

  /**
   * Assigns focus to the editor.
   */
  public focus(options: { selectAll?: boolean } = {}) {
    const { view, state } = this.editor;
    if (view) {
      if (options.selectAll) {
        commands.selectAll(state, this.dispatch);
      }
      view.focus();
    }
  }

  /**
   * Initializes the PromiseMirror editor component.
   */
  public init(value: string) {
    if (this.view) {
      this.view.destroy();
    }

    const state = EditorState.create({
      doc: defaultMarkdownParser.parse(value),
      plugins: [
        ...exampleSetup({ schema, menuBar: false }),
        // history(),
        // keymap({ 'Mod-z': undo, 'Mod-y': redo }),
      ],
    });
    this.view = new EditorView<DocSchema>(this.el, {
      state,
      dispatchTransaction: this.dispatch,
    });
    this.fireChanged();
  }

  /**
   * Loads the given markdown document (replacing any existing content).
   */
  public load(value: string) {
    const { state } = this.editor;
    const node = defaultMarkdownParser.parse(value);
    const tr = state.tr;
    tr.replaceWith(0, tr.doc.content.size, node);
    this.dispatch(tr);
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <div
        ref={this.elRef}
        {...this.props.style}
        className={constants.CSS_CLASS.EDITOR}
        onClick={this.handleClick}
      />
    );
  }

  /**
   * [Handlers]
   */
  private dispatch = (transaction: t.Transaction<DocSchema>) => {
    const view = this.view;
    const self = this; // tslint:disable-line

    const state = {
      from: view.state,
      to: view.state.apply(transaction),
    };

    const value = {
      get from() {
        return TextEditor.serialize(state.from);
      },
      get to() {
        return TextEditor.serialize(state.to);
      },
    };

    // Fire the BEFORE event.
    let isCancelled = false;
    const modifierKeys = { ...this.modifierKeys };
    this.fire({
      type: 'EDITOR/changing',
      payload: {
        transaction,
        state,
        value,
        modifierKeys,
        get isCancelled() {
          return isCancelled;
        },
        cancel() {
          isCancelled = true;
        },
        get size() {
          return self.size;
        },
      },
    });
    if (isCancelled) {
      return;
    }

    // Update the state of the editor.
    view.updateState(state.to);

    // Fire the AFTER event.
    this.fireChanged();
  };

  private fire(e: t.TextEditorEvent) {
    this._events$.next(e);
  }

  private fireChanged() {
    const self = this; // tslint:disable-line
    const modifierKeys = { ...this.modifierKeys };

    const state = {
      from: this._prevState,
      to: this.view.state,
    };

    const value = {
      get from() {
        return state.from ? TextEditor.serialize(state.from) : '';
      },
      get to() {
        return TextEditor.serialize(state.to);
      },
    };

    this.fire({
      type: 'EDITOR/changed',
      payload: {
        state,
        value,
        modifierKeys,
        get size() {
          return self.size;
        },
      },
    });

    this._prevState = state.to;
  }

  private handleClick = () => this.focus();
}
