import '../../styles';

import { defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, GlamorValue, containsFocus, constants } from '../../common';
import * as t from './types';

// @ts-ignore
const exampleSetup = require('prosemirror-example-setup').exampleSetup;
const schema = require('prosemirror-markdown').schema;

export type DocSchema = any;

export type ITextEditorProps = {
  events$?: Subject<t.TextEditorEvent>;
  focusOnLoad?: boolean;
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
    this.load('');

    if (this.props.focusOnLoad) {
      this.focus();
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get content() {
    return defaultMarkdownSerializer.serialize(this.view.state.doc);
  }

  public get isFocused() {
    return containsFocus(this.el) || this.view.hasFocus();
  }

  /**
   * [Methods]
   */
  public focus() {
    if (this.view && this.el) {
      this.view.focus();
    }
  }

  public load(content: string) {
    if (this.view) {
      this.view.destroy();
    }

    const state = EditorState.create({
      doc: defaultMarkdownParser.parse(content),
      plugins: [
        ...exampleSetup({ schema, menuBar: false }),
        // history(),
        // keymap({ 'Mod-z': undo, 'Mod-y': redo }),
      ],
    });
    this.view = new EditorView<DocSchema>(this.el, {
      state,
      dispatchTransaction: this.dispatcher,
    });
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
  private dispatcher = (transaction: t.Transaction<DocSchema>) => {
    const view = this.view;
    let state = view.state;
    const events$ = this._events$;

    // Fire the BEFORE event.
    let isCancelled = false;
    events$.next({
      type: 'EDITOR/changing',
      payload: {
        transaction,
        view,
        state,
        content: this.content,
        get isCancelled() {
          return isCancelled;
        },
        cancel() {
          isCancelled = true;
        },
      },
    });
    if (isCancelled) {
      return;
    }

    // Update the state of the editor.
    state = view.state.apply(transaction);
    view.updateState(state);

    // Fire the AFTER event.
    events$.next({
      type: 'EDITOR/changed',
      payload: { transaction, view, state, content: this.content },
    });
  };

  private handleClick = () => {
    this.focus();
  };
}
