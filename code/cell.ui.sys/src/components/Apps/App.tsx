import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { COLORS, color, css, CssValue, t, ui, Uri, filesize, stripHttp } from '../../common';
import { Card, IPropListItem, PropList, Button } from '../primitives';
import { IAppData } from './types';

export type IAppProps = {
  app: IAppData;
  style?: CssValue;
  onClick?: AppClickEventHandler;
};

export type AppClickEvent = { app: IAppData };
export type AppClickEventHandler = (e: AppClickEvent) => void;

export type IAppState = {};

export class App extends React.PureComponent<IAppProps, IAppState> {
  public state: IAppState = {};
  private state$ = new Subject<Partial<IAppState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IAppProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get app() {
    return this.props.app;
  }

  public get name() {
    let name = this.app.props.name;
    name = name.includes('/') ? name.split('/')[1] : name;
    return name;
  }

  public get host() {
    return this.context.client.host;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        fontSize: 14,
        Flex: 'vertical-stretch-stretch',
        color: COLORS.DARK,
      }),
      card: css({
        marginBottom: 30,
      }),
      body: css({
        PaddingY: 10,
        paddingLeft: 15,
        paddingRight: 15,
      }),
      name: css({ fontWeight: 'bolder' }),
      typename: css({ opacity: 0.5 }),
      title: css({
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        PaddingX: 10,
        PaddingY: 8,
        marginBottom: 5,
        backgroundColor: color.format(-0.03),
        Flex: 'horizontal-stretch-spaceBetween',
        fontSize: 11,
        userSelect: 'none',
      }),
      footer: css({
        borderTop: `solid 1px ${color.format(-0.1)}`,
        PaddingX: 10,
        PaddingY: 10,
        marginTop: 5,
        backgroundColor: color.format(-0.03),
        Flex: 'horizontal-stretch-spaceBetween',
        fontSize: 11,
        userSelect: 'none',
      }),
    };

    const app = this.app;
    const row = Uri.parse<t.IRowUri>(app.uri).parts;
    const link = `${this.host}/ns:${row.ns}?cells=${row.key}:${row.key}`;
    const size = `${app.props.width} x ${app.props.height}`;

    const items: IPropListItem[] = [
      { label: 'uri', value: app.uri },
      { label: 'link', value: stripHttp(this.host), clipboard: link },
      { label: 'dev:port', value: app.props.devPort.toString() },
      { label: 'bundle', value: filesize(app.props.bytes) },
      { label: 'size (default)', value: size },
      { label: 'windows (total)', value: app.windows.total.toString() },
    ];

    return (
      <div {...css(styles.base, this.props.style)} onClick={this.onClick}>
        <Card style={styles.card}>
          <div>
            <div {...styles.title}>
              <div {...styles.name}>{this.name}</div>
              <div {...styles.typename}>{app.typename}</div>
            </div>
            <div {...styles.body}>
              <PropList items={items} />
              {/* {this.renderApps()} */}
              {/* {this.renderWindows()} */}
            </div>
            <div {...styles.footer}>
              {this.renderFooterButton({ label: 'Windows', onClick: this.onWindowsClick })}
              {this.renderFooterButton({ label: 'New Window', onClick: this.onNewWindowClick })}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  private renderFooterButton(props: { label: string; onClick?: () => void }) {
    const styles = {
      base: css({ Flex: 'center-center' }),
      button: css({ fontSize: 12 }),
    };
    return (
      <Button style={styles.button} onClick={props.onClick}>
        {props.label}
      </Button>
    );
  }

  /**
   * [Handlers]
   */
  private onClick = () => {
    const { onClick } = this.props;
    if (onClick) {
      const app = this.app;
      onClick({ app });
      console.log('app', app);
    }
  };

  private onNewWindowClick = () => {
    const ctx = this.context;
    const app = this.props.app;
    const name = app.props.name;

    // TEMP 🐷
    ctx.fire({
      type: 'IPC/debug',
      payload: {
        source: ctx.def,
        data: { action: 'OPEN', name },
      },
    });
  };

  private onWindowsClick = () => {
    const app = this.props.app;
    this.context.fire({
      type: 'APP:SYS/overlay',
      payload: {
        overlay: { kind: 'WINDOWS', uri: app.uri },
      },
    });
  };
}
