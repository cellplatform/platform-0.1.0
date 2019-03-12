import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, GlamorValue, renderer, t } from '../../common';
import { DbHeader } from './components/DbHeader';
import { DbWatch } from './components/DbWatch';
import { Info } from './components/Info';
import { Network } from './components/Network';
import { NoteEditor } from './components/NoteEditor';

export type IShellMainProps = {
  db?: t.ITestRendererDb;
  network?: t.INetwork;
  style?: GlamorValue;
};
export type IShellMainState = {};

export class ShellMain extends React.PureComponent<IShellMainProps, IShellMainState> {
  public state: IShellMainState = {};
  public static contextType = renderer.Context;
  public context!: t.ITestRendererContext;
  private unmounted$ = new Subject();
  private state$ = new Subject<IShellMainState>();

  /**
   * [Lifecycle]
   */

  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const change$ = this.cli.change$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
    change$.subscribe(e => this.forceUpdate());
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
    const styles = {
      base: css({
        flex: 1,
        Flex: 'vertical-stretch-stretch',
        paddingTop: !db && 20,
      }),
      header: css({ padding: 20 }),
      body: css({
        position: 'relative',
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
        PaddingX: 20,
      }),
    };

    const elDbHeader = db && <DbHeader db={db} style={styles.header} />;

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
    const elEditor = db && network && ns && ns.command.name === 'editor' && <NoteEditor db={db} />;
    const elWatch = db && !elDbInfo && !elEditor && !elNetwork && <DbWatch db={db} />;

    return (
      <div {...styles.base}>
        {elDbInfo}
        {elNetwork}
        {elWatch}
        {elEditor}
      </div>
    );
  }
}
