import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { color, css, CommandShell, t } from '../common';
import { TestCellEditor } from './Test.CellEditor';

export class Test extends React.PureComponent<{}, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<t.ITestState>>();
  private events$ = new Subject<t.CellEditorEvent>();
  private cli: t.ICommandState = cli.init({
    state$: this.state$,
    getEditorViews: () => this.instances.map(el => el.editor),
  });

  private instances: TestCellEditor[] = [];
  private instanceRef = (ref: TestCellEditor) => this.instances.push(ref);

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    events$.subscribe(e => {
      console.log('🌳', e.type, e.payload);
    });

    const changing$ = events$.pipe(
      filter(e => e.type === 'CELL_EDITOR/changing'),
      map(e => e.payload as t.ICellEditorChanging),
    );
    const changed$ = events$.pipe(
      filter(e => e.type === 'CELL_EDITOR/changed'),
      map(e => e.payload as t.ICellEditorChanged),
    );

    changing$.subscribe(e => {
      // e.cancel();
    });

    changed$.subscribe(e => {
      //
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get editor() {
    return this.instances[0].editor;
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <CommandShell cli={this.cli} tree={{}}>
        {this.renderBody()}
      </CommandShell>
    );
  }

  public renderBody() {
    const styles = {
      base: css({
        Scroll: true,
        position: 'relative',
        flex: 1,
        PaddingX: 20,
        paddingTop: 10,
        backgroundColor: color.format(1),
        userSelect: 'none',
      }),
    };

    return (
      <div {...styles.base}>
        {this.renderEditor('FORMULA')}
        {this.renderEditor('TEXT')}
        {this.renderEditor('MARKDOWN')}
      </div>
    );
  }

  private renderEditor(mode: t.CellEditorMode) {
    return <TestCellEditor ref={this.instanceRef} title={mode.toLowerCase()} mode={mode} />;
  }
}
