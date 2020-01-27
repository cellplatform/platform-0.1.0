import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, renderer, t } from '../../common';
import { DbHeader } from './components/DbHeader';
import { DbWatch } from './components/DbWatch';
import { Info } from './components/Info';
import { Network } from './components/Network';
import { NoteEditor } from './components/NoteEditor';
import { DbGrid } from './components/DbGrid';

export type IShellMainProps = {
  db?: t.ITestRendererDb;
  network?: t.INetwork;
  style?: CssValue;
};
export type IShellMainState = {};

export class ShellMain extends React.PureComponent<IShellMainProps, IShellMainState> {
  public state: IShellMainState = {};
  public static contextType = renderer.Context;
  public context!: t.ITestRendererContext;
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<IShellMainState>();

  /**
   * [Lifecycle]
   */

  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
    const changed$ = this.cli.changed$.pipe(takeUntil(this.unmounted$));
    changed$.subscribe(e => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get cli() {
    return this.context.cli.state;
  }

  public get store() {
    return this.context.store as t.ITestStore;
  }

  /**
   * [Render]
   */
  public render() {
    const { db } = this.props;
    const ns = this.cli.namespace;
    const isGrid = ns && ns.command.name === 'grid';

    const styles = {
      base: css({
        flex: 1,
        Flex: 'vertical-stretch-stretch',
        paddingTop: !db ? 20 : undefined,
      }),
      header: css({ padding: 20 }),
      body: css({
        position: 'relative',
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
        PaddingX: isGrid ? 0 : 20,
      }),
    };

    const elDbHeader = db && !isGrid && <DbHeader db={db} style={styles.header} />;

    return (
      <div {...css(styles.base, this.props.style)}>
        {elDbHeader}
        <div {...styles.body}>{this.renderOutput()}</div>
      </div>
    );
  }

  private renderOutput() {
    const { db, network } = this.props;
    const cli = this.cli;
    const ns = cli.namespace;
    const styles = {
      base: css({
        flex: 1,
        display: 'flex',
      }),
    };
    const elDbInfo = ns && ns.command.name === 'info' && <Info key={db && db.localKey} db={db} />;
    const elNetwork = db && network && ns && ns.command.name === 'network' && (
      <Network key={`${network.topic}/${db.localKey}`} network={network} />
    );
    const elEditor = db && ns && ns.command.name === 'editor' && <NoteEditor db={db} />;
    const elGrid = db && ns && ns.command.name === 'grid' && <DbGrid db={db} />;
    const elWatch = db && !elDbInfo && !elEditor && !elNetwork && !elGrid && <DbWatch db={db} />;

    return (
      <div {...styles.base}>
        {elDbInfo}
        {elNetwork}
        {elWatch}
        {elGrid}
        {elEditor}
      </div>
    );
  }
}
