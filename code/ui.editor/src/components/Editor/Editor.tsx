import './css';

import { defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, GlamorValue } from '../../common';
import * as t from './types';

// @ts-ignore
const exampleSetup = require('prosemirror-example-setup').exampleSetup;
const schema = require('prosemirror-markdown').schema;

export type DocSchema = any;

export type IEditorProps = {
  events$?: Subject<t.EditorEvent>;
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
export class Editor extends React.PureComponent<IEditorProps> {
  /**
   * [Fields]
   */
  private el: HTMLDivElement;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);
  private view: EditorView;

  private unmounted$ = new Subject();
  private readonly _events$ = new Subject<t.EditorEvent>();
  public readonly events$ = this._events$.pipe(takeUntil(this.unmounted$));

  /**
   * [Constructor]
   */
  constructor(props: IEditorProps) {
    super(props);
    if (props.events$) {
      this.events$.subscribe(props.events$);
    }
  }

  public componentDidMount() {
    const content = '';
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

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  public get content() {
    return defaultMarkdownSerializer.serialize(this.view.state.doc);
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return (
      <div ref={this.elRef} {...css(styles.base, this.props.style)} onClick={this.handleClick} />
    );
  }

  /**
   * [Internal]
   */
  private dispatcher = (transaction: t.Transaction<DocSchema>) => {
    const view = this.view;
    let state = view.state;

    // Fire the "pre" event.
    type E = t.IEditorTransactionEvent;
    this._events$.next({
      type: 'EDITOR/transaction',
      payload: { stage: 'BEFORE', transaction, view, state, content: this.content },
    });

    // Update the state of the editor.
    state = view.state.apply(transaction);
    view.updateState(state);

    // Fire the "post" event.
    this._events$.next({
      type: 'EDITOR/transaction',
      payload: { stage: 'AFTER', transaction, view, state, content: this.content },
    });
  };

  private handleClick = () => {
    this.view.focus();
  };
}
