import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { color, css, CssValue, rx, t, ui, AppModel } from '../../common';
import { Installer } from '../Installer';
import { App, AppClickEvent, AppClickEventHandler } from './App';
import { IAppData } from './types';
import { Icons, Button } from '../primitives';

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
    rx.payload<t.ITypedSheetUpdatedEvent>(ctx.event$, 'SHEET/updated')
      .pipe(debounceTime(200))
      .subscribe((e) => this.load());
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

  public get isEmpty() {
    return this.apps.length === 0;
  }

  /**
   * [Methods]
   */

  public load = async () => {
    const ctx = this.context;
    const client = ctx.client;
    const cursor = await ctx.window.app.sheet.data('App').load({ range: '1:500' });

    const wait = cursor.rows.map(async (row) => {
      const model = await AppModel.load({ client, uri: row.toString() });
      const windows = await row.props.windows.data();
      const total = windows.total;
      const typename = row.typename;
      const item: IAppData = { typename, total, model };
      return item;
    });

    const apps = await Promise.all(wait);
    this.state$.next({ apps });
  };

  /**
   * [Render]
   */
  public render() {
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

    return (
      <div {...styles.base}>
        <div {...styles.top}>
          {this.renderRefresh()}
          {this.renderEmpty()}
          {this.renderList()}
        </div>
        <div {...styles.bottom}>
          <Installer />
        </div>
      </div>
    );
  }

  private renderEmpty() {
    if (!this.isEmpty) {
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

  private renderRefresh() {
    const styles = {
      base: css({
        Absolute: [2, 2, null, null],
      }),
    };
    return (
      <Button style={styles.base} onClick={this.onRefreshClick}>
        <Icons.Refresh size={16} />
      </Button>
    );
  }

  private renderList() {
    if (this.isEmpty) {
      return null;
    }

    const styles = {
      base: css({}),
    };

    const elList = this.apps.map((app, i) => {
      return <App key={i} app={app} onClick={this.props.onAppClick} />;
    });

    return <div {...styles.base}>{elList}</div>;
  }

  /**
   * [Handlers]
   */
  private onRefreshClick = () => this.load();
}
