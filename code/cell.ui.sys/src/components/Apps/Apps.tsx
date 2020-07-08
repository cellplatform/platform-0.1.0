import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, rx, t, ui } from '../../common';
import { Installer } from '../Installer';
import { App, AppClickEvent, AppClickEventHandler } from './App';
import { IAppData } from './types';

export { IAppData, AppClickEventHandler, AppClickEvent };
export type IAppsProps = {
  style?: CssValue;
  onAppClick?: AppClickEventHandler;
};
export type IAppsState = { apps?: IAppData[] };

export class Apps extends React.PureComponent<IAppsProps, IAppsState> {
  public state: IAppsState = {};
  private state$ = new Subject<Partial<IAppsState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const ctx = this.context;
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    this.load();
    rx.payload<t.ITypedSheetUpdatedEvent>(ctx.event$, 'SHEET/updated').subscribe((e) => {
      this.load();
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get client() {
    return this.context.client;
  }

  public get apps() {
    return this.state.apps || [];
  }

  /**
   * [Methods]
   */
  public async load() {
    const ctx = this.context;
    const data = await ctx.window.app.sheet.data('App').load();

    const wait = data.rows.map(async (row) => {
      const uri = row.toString();
      const windows = await row.props.windows.data();
      const item: IAppData = {
        typename: row.typename,
        types: row.types.list,
        props: row.toObject(),
        uri,
        windows,
      };
      return item;
    });
    const apps = await Promise.all(wait);
    this.state$.next({ apps });
  }

  /**
   * [Render]
   */
  public render() {
    const apps = this.apps;
    const isEmpty = apps.length === 0;

    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'vertical-stretch-stretch',
      }),
      top: css({
        Scroll: true,
        flex: 1,
        position: 'relative',
        boxSizing: 'border-box',
        padding: 20,
      }),
      bottom: css({
        position: 'relative',
        height: 80,
        backgroundColor: color.format(-0.03),
        borderTop: `solid 1px ${color.format(-0.1)}`,
      }),
    };

    const elList = apps.map((app, i) => {
      return <App key={i} app={app} onClick={this.props.onAppClick} />;
    });

    return (
      <div {...styles.base}>
        <div {...styles.top}>
          {!isEmpty && elList}
          {isEmpty && this.renderEmpty()}
        </div>
        <div {...styles.bottom}>
          <Installer />
        </div>
      </div>
    );
  }

  private renderEmpty() {
    const apps = this.apps;
    if (apps.length > 0) {
      return null;
    }
    const styles = {
      base: css({
        opacity: 0.5,
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
        userSelect: 'none',
      }),
    };
    return (
      <div {...styles.base}>
        <div>No applications installed.</div>
      </div>
    );
  }
}
