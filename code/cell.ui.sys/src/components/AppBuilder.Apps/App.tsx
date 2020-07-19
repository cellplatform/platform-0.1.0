import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { COLORS, color, css, CssValue, t, ui, filesize, stripHttp } from '../../common';
import { Card, IPropListItem, PropList } from '../primitives';
import { IAppData } from './types';
import { ActionButton, IActionButtonOption } from '../ActionButton';

export type IAppProps = {
  app: IAppData;
  style?: CssValue;
  onClick?: AppClickEventHandler;
};

export type AppClickEvent = { app: IAppData };
export type AppClickEventHandler = (e: AppClickEvent) => void;

export type IAppState = t.Object;

export class App extends React.PureComponent<IAppProps, IAppState> {
  public state: IAppState = {};
  private state$ = new Subject<Partial<IAppState>>();
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
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

  public get model() {
    return this.app.model;
  }

  public get uri() {
    return this.model.uri.toString();
  }

  public get name() {
    return this.model.props.name || '';
  }

  public get displayName() {
    let name = this.name;
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
    const model = this.model;
    const props = model.props;
    const row = model.uri;
    const link = `${this.host}/ns:${row.ns}?cells=${row.key}:${row.key}`;

    const bytes = props.bytes;
    const port = props.devPort.toString();
    const bundle = `${filesize(bytes)} (dev:${port})`;

    const items: IPropListItem[] = [
      { label: 'uri', value: this.uri },
      { label: 'version', value: props.version },
      { label: 'link', value: stripHttp(this.host), clipboard: link },
      { label: 'bundle', value: bundle },
      { label: 'windows (total)', value: app.total.toString() },
    ];

    return (
      <div {...css(styles.base, this.props.style)} onClick={this.onClick}>
        <Card style={styles.card}>
          <div>
            <div {...styles.title}>
              <div {...styles.name}>{this.displayName}</div>
              <div {...styles.typename}>{app.typename}</div>
            </div>
            <div {...styles.body}>
              <PropList items={items} />
            </div>
            <div {...styles.footer}>
              {this.renderFooterButton({ label: 'Windows', onClick: this.onWindowsClick })}
              {this.renderNewWindowButton()}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  private renderNewWindowButton() {
    const model = this.model;
    const argv = model.props.argv || [];
    const options = argv
      .map((arg) => arg.trim())
      .filter((arg) => arg.startsWith('entry:'))
      .map((arg) => {
        return {
          label: arg.replace(/^entry:/, ''),
          onClick: this.newWindowHandler(arg),
        };
      });

    return this.renderFooterButton({
      label: 'New Window',
      onClick: this.newWindowHandler(),
      options,
    });
  }

  private renderFooterButton(props: {
    label: string;
    onClick?: () => void;
    options?: IActionButtonOption[];
  }) {
    const styles = {
      base: css({ fontSize: 12 }),
    };
    return (
      <ActionButton style={styles.base} onClick={props.onClick} options={props.options}>
        {props.label}
      </ActionButton>
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
    }
  };

  private newWindowHandler = (arg?: string) => {
    return () => {
      const ctx = this.context;
      const name = this.name;

      // TEMP 🐷
      ctx.fire({
        type: 'IPC/debug',
        payload: {
          source: ctx.env.def,
          data: { action: 'OPEN', name, arg },
        },
      });
    };
  };

  private onWindowsClick = () => {
    this.context.fire({
      type: 'APP:SYS/overlay',
      payload: {
        overlay: { kind: 'WINDOWS', uri: this.uri },
      },
    });
  };
}
