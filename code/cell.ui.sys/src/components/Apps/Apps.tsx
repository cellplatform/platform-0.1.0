import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, t } from '../../common';
import { App, IAppData, AppClickEventHandler, AppClickEvent } from './App';

export { IAppData, AppClickEventHandler, AppClickEvent };
export type IAppsProps = {
  env: t.IEnv;
  client: t.IClientTypesystem;
  style?: CssValue;
  onAppClick?: AppClickEventHandler;
};
export type IAppsState = { apps?: IAppData[] };

export class Apps extends React.PureComponent<IAppsProps, IAppsState> {
  public state: IAppsState = {};
  private state$ = new Subject<Partial<IAppsState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IAppsProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.load();

    const { env } = this.props;

    env.event$.subscribe(async (e) => {
      // TEMP 🐷HACK - to not brute force the reload like this!
      // Should use proper cache-patching handled in the event stream.
      this.client.cache.clear();
      await this.load();
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
    return this.props.client;
  }

  /**
   * [Methods]
   */
  public async load() {
    const sheet = await this.client.sheet('ns:sys.app');
    const apps = await sheet.data<t.App>('App').load();

    const wait = apps.rows.map(async (row) => {
      const uri = row.toString();
      const windows = await row.props.windows.data();
      const item: IAppData = {
        typename: row.typename,
        types: row.types.list,
        props: row.toObject(),
        uri,
        windows,
      };
      console.log('item', item);
      return item;
    });

    this.state$.next({ apps: await Promise.all(wait) });
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return <div {...css(styles.base, this.props.style)}>{this.renderApps()}</div>;
  }

  private renderApps() {
    const { env } = this.props;
    const { apps = [] } = this.state;
    if (!apps) {
      return null;
    }

    const styles = {
      base: css({}),
    };

    const elList = apps.map((app, i) => {
      return <App key={i} app={app} env={env} onClick={this.props.onAppClick} />;
    });

    return <div {...styles.base}>{elList}</div>;
  }
}
