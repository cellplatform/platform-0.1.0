import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { Shell, t } from '../common';
import { TestCellEditor } from './Test.CellEditor';
import { TestGrid } from './Test.Grid';

const KEY = {
  VIEW: 'ui.datagrid/view',
  EDITOR: 'ui.datagrid/editor',
};

function fromStorage<T = any>(key: string, defaultValue?: T): T | undefined {
  const value = localStorage.getItem(key);
  return (value === undefined ? defaultValue : value) as T;
}

export type ITestProps = {};
export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private cli = cli.init({ state$: this.state$ });

  /**
   * [Lifecycle]
   */

  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    // Save and resume the current view using local-storage.
    const view = fromStorage<t.TestViewType>(KEY.VIEW, this.viewType);
    const editor = fromStorage<t.TestEditorType>(KEY.EDITOR, this.editorType);
    this.cli.change({ text: view || '', namespace: true });
    this.state$.next({ view, editor });
    state$.subscribe(() => {
      localStorage.setItem(KEY.VIEW, this.viewType);
      localStorage.setItem(KEY.EDITOR, this.editorType);
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get viewType(): t.TestViewType {
    return this.state.view || 'grid';
  }

  public get editorType(): t.TestEditorType {
    return this.state.editor || 'debug';
  }

  /**
   * [Render]
   */

  public render() {
    const view = this.viewType;
    const elGrid = view === 'grid' && <TestGrid editorType={this.editorType} />;
    const elCellEditor = view === 'editor' && <TestCellEditor />;
    return (
      <Shell cli={this.cli}>
        {elGrid}
        {elCellEditor}
      </Shell>
    );
  }
}
