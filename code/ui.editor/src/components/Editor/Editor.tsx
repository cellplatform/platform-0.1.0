import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';

import './css';
import * as React from 'react';
import { css, color, GlamorValue } from '../../common';
import * as t from './types';

import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { undo, redo, history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';

export type DocSchema = any;

export type IEditorProps = {
  events$?: Subject<t.EditorEvent>;
  style?: GlamorValue;
};

/**
 * A prose-mirror editor.
 *
 * See:
 *  - https://prosemirror.net/docs/guide/
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
    const state = EditorState.create({
      schema,
      plugins: [history(), keymap({ 'Mod-z': undo, 'Mod-y': redo })],
    });
    this.view = new EditorView<DocSchema>(this.el, {
      state,
      dispatchTransaction: this.dispatcher,
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({}),
    };
    return <div ref={this.elRef} {...css(styles.base, this.props.style)} />;
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
      payload: { stage: 'BEFORE', transaction, view, state },
    });

    // Update the state of the editor.
    state = view.state.apply(transaction);
    view.updateState(state);

    // Fire the "post" event.
    this._events$.next({
      type: 'EDITOR/transaction',
      payload: { stage: 'AFTER', transaction, view, state },
    });
  };
}
