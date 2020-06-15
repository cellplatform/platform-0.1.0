import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, rx, t, ui } from '../../common';
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
  constructor(props: IAppsProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.load();

    const ctx = this.context;

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
    const sheet = await this.client.sheet('ns:sys.app');
    const data = await sheet.data<t.App>('App').load();

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

    const apps = (await Promise.all(wait)) //.filter((app) => !app.props.name.endsWith('cell.ui.sys'));
    this.state$.next({ apps });
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderEmpty()}
        {this.renderApps()}
      </div>
    );
  }

  private renderApps() {
    const apps = this.apps;
    if (apps.length === 0) {
      return null;
    }

    const styles = {
      base: css({}),
    };

    const elList = apps.map((app, i) => {
      return <App key={i} app={app} onClick={this.props.onAppClick} />;
    });

    return <div {...styles.base}>{elList}</div>;
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
      }),
    };
    return (
      <div {...styles.base}>
        <div>No applications installed.</div>
      </div>
    );
  }
}
