import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { t } from '../common';
import { TestGrid } from './Test.Grid';

const KEY = {
  EDITOR: 'ui.datagrid/editor',
};

function fromStorage<T = any>(key: string, defaultValue?: T): T | undefined {
  const value = localStorage.getItem(key);
  return (value === undefined ? defaultValue : value) as T;
}

export type ITestProps = Record<string, unknown>;
export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject<void>();
  private state$ = new Subject<Partial<t.ITestState>>();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe((e) => this.setState(e));

    // Save and resume the current view using local-storage.
    const editor = fromStorage<t.TestEditorType>(KEY.EDITOR, this.editorType);
    this.state$.next({ editor });
    state$.subscribe(() => {
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

  public get editorType(): t.TestEditorType {
    return this.state.editor || 'debug';
  }

  /**
   * [Render]
   */

  public render() {
    return <TestGrid editorType={this.editorType} left={true} />;
  }
}
