import { CommandPrompt } from '@platform/ui.cli';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { init as initCommandLine } from '../cli';
import { color, COLORS, css, t } from '../common';
import { TestCellEditor } from './Test.CellEditor';
import { TestGrid } from './Test.Grid';

const KEY = {
  VIEW: 'ui.datagrid/view',
};

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
    const view = this.viewStorage;
    this.cli.change({ text: view, namespace: true });
    this.state$.next({ view });
    state$.subscribe(() => (this.viewStorage = this.view));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */

  public get view(): t.TestView {
    return this.state.view || 'grid';
  }

  public get viewStorage(): t.TestView {
    return (localStorage.getItem(KEY.VIEW) as t.TestView) || this.view;
  }
  public set viewStorage(view: t.TestView) {
    localStorage.setItem(KEY.VIEW, view);
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        backgroundColor: color.format(-0.08),
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

    const view = this.view;
    const elGrid = view === 'grid' && <TestGrid />;
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
