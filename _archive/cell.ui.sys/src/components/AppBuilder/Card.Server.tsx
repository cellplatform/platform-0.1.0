import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, t, ui, COLORS } from '../../common';
import { Card, PropList } from '../primitives';
import { Icons } from '../Icons';

export type IServerCardProps = { style?: CssValue };
export type IServerCardState = { info?: t.IResGetElectronSysInfo };

export class ServerCard extends React.PureComponent<IServerCardProps, IServerCardState> {
  public state: IServerCardState = {};
  private state$ = new Subject<Partial<IServerCardState>>();
  private unmounted$ = new Subject<void>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

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
    const http = this.context.client.http;
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
      base: css({ display: 'flex' }),
      card: css({
        PaddingX: 15,
        PaddingY: 15,
      }),
      icon: css({ Absolute: [10, 15, null, null] }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <Card padding={0} style={{ flex: 1 }}>
          <div {...styles.card}>
            <PropList title={'HTTP Endpoint'} items={this.info} />
            <PropList.Hr />
            <PropList title={'Versions'} items={this.versions} />
          </div>
          <Icons.Wifi style={styles.icon} size={18} color={COLORS.DARK} />
        </Card>
      </div>
    );
  }
}
