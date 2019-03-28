import '../../styles';

import { defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as commands from 'prosemirror-commands';

import { css, GlamorValue, containsFocus, constants } from '../../common';
import * as t from './types';

// @ts-ignore
const exampleSetup = require('prosemirror-example-setup').exampleSetup;
const schema = require('prosemirror-markdown').schema;

export type DocSchema = any;

export type ITextEditorProps = {
  markdown?: string;
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
   * [Fields]
   */
  private el: HTMLDivElement;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);
  private view: EditorView;

  private unmounted$ = new Subject();
  private _events$ = new Subject<t.TextEditorEvent>();
  public events$ = this._events$.pipe(takeUntil(this.unmounted$));

  /**
   * [Constructor]
   */

  public componentWillMount() {
    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
    }
  }

  public componentDidMount() {
    const { focusOnLoad, selectOnLoad, markdown = '' } = this.props;
    this.init(markdown);
    if (focusOnLoad) {
      this.focus({ selectAll: selectOnLoad });
    }
  }

  public componentDidUpdate(prev: ITextEditorProps) {
    const { markdown = '' } = this.props;
    if (prev.markdown !== markdown) {
      if (markdown !== this.markdown) {
        this.load(markdown);
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

  public get markdown() {
    const doc = this.view.state.doc;
    return defaultMarkdownSerializer.serialize(doc);
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
  public init(markdown: string) {
    if (this.view) {
      this.view.destroy();
    }

    const state = EditorState.create({
      doc: defaultMarkdownParser.parse(markdown),
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
  public load(markdown: string) {
    const { state } = this.editor;
    const node = defaultMarkdownParser.parse(markdown);
    const tr = state.tr;
    tr.replaceWith(0, tr.doc.content.size, node);
    this.dispatch(tr);
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return (
      <div
        ref={this.elRef}
        {...css(styles.base, this.props.style)}
        className={constants.CSS_CLASS.EDITOR}
        onClick={this.handleClick}
      />
    );
  }

  /**
   * [Handlers]
   */
  private dispatch = (tr: t.Transaction<DocSchema>) => {
    const view = this.view;
    let state = view.state;
    const self = this; // tslint:disable-line

    // Fire the BEFORE event.
    let isCancelled = false;
    this.fire({
      type: 'EDITOR/changing',
      payload: {
        transaction: tr,
        view,
        state,
        markdown: this.markdown,
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
    state = state.apply(tr);
    view.updateState(state);

    // Fire the AFTER event.
    this.fireChanged();
  };

  private fire(e: t.TextEditorEvent) {
    this._events$.next(e);
  }

  private fireChanged() {
    const self = this; // tslint:disable-line
    this.fire({
      type: 'EDITOR/changed',
      payload: {
        view: this.view,
        state: this.view.state,
        markdown: this.markdown,
        get size() {
          return self.size;
        },
      },
    });
  }

  private handleClick = () => this.focus();
}
