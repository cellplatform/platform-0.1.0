import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Client, css, CssValue, t } from '../../common';
import { Card, PropList } from '../primitives';

export type IServerProps = { env: t.IEnv; client: t.IClientTypesystem; style?: CssValue };
export type IServerState = { info?: t.IResGetElectronSysInfo };

export class Server extends React.PureComponent<IServerProps, IServerState> {
  public state: IServerState = {};
  private state$ = new Subject<Partial<IServerState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IServerProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.load();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get info() {
    const data = this.state.info || {};
    return Object.keys(data)
      .map((key) => ({ key, value: data[key] }))
      .filter(({ value }) => typeof value === 'string' || typeof value === 'number')
      .filter(({ key }) => !['hash', 'system'].includes(key))
      .map(({ key, value }) => ({ label: key, value: value }));
  }

  public get versions() {
    const data = this.state.info?.app.versions || {};
    return Object.keys(data)
      .map((key) => ({ key, value: data[key] }))
      .map(({ key, value }) => ({ label: key, value: value }));
  }

  /**
   * Methods
   */
  public async load() {
    const http = this.props.client.http;
    const res = await http.info<t.IResGetElectronSysInfo>();
    this.state$.next({ info: res.body });
  }

  /**
   * [Render]
   */
  public render() {
    const { info: serverInfo } = this.state;
    if (!serverInfo) {
      return null;
    }
    const styles = {
      base: css({}),
      card: css({
        PaddingX: 15,
        PaddingY: 15,
      }),
    };

    return (
      <div {...styles.base}>
        <Card minWidth={300} padding={0}>
          <div {...styles.card}>
            <PropList title={'HTTP Endpoint'} items={this.info} />
            <PropList.Hr />
            <PropList title={'Versions'} items={this.versions} />
          </div>
        </Card>
      </div>
    );
  }
}
