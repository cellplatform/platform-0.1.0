import { CommandPrompt } from '@platform/ui.cli';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { init as initCommandLine } from '../cli';
import { COLORS, css, t } from '../common';
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
  private cli = initCommandLine({ state$: this.state$ });

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
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'vertical',
      }),
      main: css({
        position: 'relative',
        display: 'flex',
        flex: 1,
      }),
      footer: css({
        backgroundColor: COLORS.DARK,
      }),
    };

    const view = this.viewType;
    const elGrid = view === 'grid' && <TestGrid editorType={this.editorType} />;
    const elCellEditor = view === 'editor' && <TestCellEditor />;

    return (
      <div {...styles.base}>
        <div {...styles.main}>
          {elGrid}
          {elCellEditor}
        </div>
        <div {...styles.footer}>
          <CommandPrompt cli={this.cli} theme={'DARK'} />
        </div>
      </div>
    );
  }
}
