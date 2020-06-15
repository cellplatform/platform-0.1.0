import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { COLORS, color, css, CssValue, t, ui, Uri, filesize } from '../../common';
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
        backgroundColor: color.format(-0.02),
        Flex: 'horizontal-stretch-spaceBetween',
        fontSize: 11,
        userSelect: 'none',
      }),
      footer: css({
        borderTop: `solid 1px ${color.format(-0.1)}`,
        PaddingX: 10,
        PaddingY: 10,
        marginTop: 5,
        backgroundColor: color.format(-0.02),
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
      { label: 'uri', value: app.uri, clipboard: link },
      { label: 'dev port', value: app.props.devPort.toString() },
      { label: 'bundle', value: filesize(app.props.bytes) },
      { label: 'size (default)', value: size },
      { label: 'windows (total)', value: app.windows.total.toString() },
      // { label: 'size', value: size },
      // { label: 'visible', value: isVisible },
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
              <div />
              {this.renderNewWindow()}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  private renderNewWindow() {
    const styles = {
      base: css({
        Flex: 'center-center',
      }),
      button: css({ fontSize: 12 }),
    };
    return (
      <div {...styles.base}>
        <Button style={styles.button} onClick={this.onNewWindowClick}>
          New Window
        </Button>
      </div>
    );
  }

  private renderWindows() {
    const { windows } = this.app;
    if (!windows) {
      return null;
    }
    const styles = {
      base: css({}),
    };

    const host = this.context.client.http.origin;

    const elList = windows.rows.map((row, i) => {
      const { x, y, width, height, isVisible } = row.props;
      const position = x === undefined || y === undefined ? '-' : `x:${x} y:${y}`;
      const size = width === undefined || height === undefined ? '-' : `${width} x ${height}`;

      const uri = row.uri.toString();

      const items: IPropListItem[] = [
        // { label: 'typename', value: row.typename },
        { label: 'uri', value: uri, clipboard: `${host}/${uri}` },
        { label: 'position', value: position },
        { label: 'size', value: size },
        { label: 'visible', value: isVisible },
      ];
      return (
        <React.Fragment key={i}>
          <PropList items={items} />
          <PropList.Hr />
        </React.Fragment>
      );
    });

    return <div {...styles.base}>{elList}</div>;
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

    console.log('name', name);

    // TEMP 🐷
    ctx.fire({
      type: 'IPC/debug',
      payload: {
        source: ctx.def,
        data: { action: 'OPEN', name },
      },
    });
  };
}
