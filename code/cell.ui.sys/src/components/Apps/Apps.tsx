import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, t } from '../../common';
import { App } from './App';

export type IAppsProps = { env: t.IEnv; client: t.IClientTypesystem; style?: CssValue };
export type IAppsState = { apps?: IAppItem[] };

type IAppItem = { name: string; uri: string; windows: t.ITypedSheetData<t.AppWindow> };

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
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    this.load();

    const { env } = this.props;

    env.event$.subscribe(async e => {
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

    const wait = apps.rows.map(async app => {
      const uri = app.toString();
      const windows = await app.props.windows.data();
      const item: IAppItem = { name: app.props.name, uri, windows };
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
      const { uri, name, windows } = app;
      return <App key={i} uri={uri} name={name} windows={windows} env={env} />;
    });

    return <div {...styles.base}>{elList}</div>;
  }
}
