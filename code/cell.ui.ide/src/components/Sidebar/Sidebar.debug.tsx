import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { coord, css, CssValue, onStateChanged, t, time, ui, Uri } from '../../common';
import { IPropListItem, PropList } from '../primitives';

export type ISidebarDebugProps = { style?: CssValue };
export type ISidebarDebugState = {};

export class SidebarDebug extends React.PureComponent<ISidebarDebugProps, ISidebarDebugState> {
  public state: ISidebarDebugState = {};
  private state$ = new Subject<Partial<ISidebarDebugState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.event$, this.unmounted$);

    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    changes
      .on('APP:IDE/uri')
      .pipe()
      .subscribe((e) => {
        this.forceUpdate();
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get store() {
    return this.context.getState();
  }

  public get uri() {
    return this.store.uri;
  }

  public get uriKey() {
    const uri = this.uri;
    return uri.substring(uri.lastIndexOf(':') + 1);
  }

  public get rowIndex() {
    return coord.cell.toRowIndex(this.uriKey);
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return <div {...css(styles.base, this.props.style)}>{this.renderPropList()}</div>;
  }

  private renderPropList() {
    const key = `B${this.rowIndex + 1}`;

    const items: IPropListItem[] = [
      { label: 'api', value: `change title (${key})`, onClick: this.changeTitle },
    ];

    return <PropList title={'Debug'} items={items} />;
  }

  /**
   * [Handlers]
   */

  private changeTitle = async () => {
    const index = this.rowIndex;
    if (index < 0) {
      return;
    }

    const ctx = this.context;
    const client = ctx.client;
    const ns = Uri.toNs(this.uri).id;

    const sheet = await client.sheet(ns);
    const cursor = await sheet.data<t.AppWindow>('AppWindow').load();

    const row = cursor.row(index);
    row.props.title = 'Hello';

    await time.delay(50);
    const changes = sheet.state.changes;
    ctx.fire({
      type: 'IPC/sheet/changed',
      payload: { source: ctx.def, ns: sheet.uri.id, changes },
    });
  };
}
