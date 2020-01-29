import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, client, Client, http, COLORS, Spinner } from '../../common';

import { URLS } from './urls';

export type IInviteProps = { style?: CssValue };
export type IInviteState = {};

export class Invite extends React.PureComponent<IInviteProps, IInviteState> {
  public state: IInviteState = {};
  private state$ = new Subject<Partial<IInviteState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IInviteProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    this.tmp();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Methods]
   */
  public async tmp() {
    // console.log('client', client);

    const host = 'dev.db.team';
    const uri = 'cell:ck5st4aop0000ffet9pi2fkvp!B1';

    const client = Client.create(host);
    const cellClient = client.cell(uri);

    // client.

    const url = 'https://dev.db.team/cell:ck5st4aop0000ffet9pi2fkvp!B1';
    // const r = await http.get(url);
    // console.log('r', r);
    // console.log('r.body', r.body);

    // console.log('url', url);
    // console.log('r.text', r.text);
    // console.log('r.contentType', r.contentType);
    // console.log('r.headers', r.headers);

    // const rr = await fetch(url);
    // console.log('rr', rr);

    // const cellClient = client.cell(uri);

    try {
      const res = await cellClient.info();
      console.log('res', res);
    } catch (error) {
      console.log('error', error);
    }
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'horizontal-stretch-stretch',
        backgroundColor: COLORS.DARK,
        color: COLORS.WHITE,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderLeft()}
        {this.renderRight()}
      </div>
    );
  }

  private renderLeft() {
    const styles = {
      base: css({
        Flex: 'vertical-stretch-stretch',
        flex: 0.5,
        minWidth: 400,
        overflow: 'hidden',
      }),
      top: css({
        flex: 1,
        Flex: 'center-center',
      }),
      bottom: css({
        borderTop: `dashed 1px ${color.format(0.8)}`,
        display: 'flex',
        height: 200,
      }),
      title: css({
        fontSize: 45,
        fontWeight: 'bold',
        lineHeight: '1em',
        userSelect: 'none',
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.top}>
          <div {...styles.title}>
            <div>Conversation</div>
            <div>invite.</div>
          </div>
        </div>
        <div {...styles.bottom}>{this.renderBottomLeft()}</div>
      </div>
    );
  }

  private renderRight() {
    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
        backgroundImage: `url(${URLS.NZ})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }),
      bevel: css({
        Absolute: [0, null, 0, 0],
        width: 10,
        backgroundColor: color.format(0.15),
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.bevel} />
      </div>
    );
  }

  private renderBottomLeft() {
    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
      }),
      bgMask: css({
        Absolute: 0,
        backgroundColor: COLORS.DARK,
      }),
      body: css({
        Absolute: 0,
        Flex: 'center-center',
      }),
      topShadow: css({
        Absolute: [-6, 0, null, 0],
        height: 10,
        backgroundColor: color.format(-1),
        filter: `blur(5px)`,
        opacity: 0.4,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.topShadow} />
        <div {...styles.bgMask} />
        <div {...styles.body}>
          <Spinner size={32} color={1} />
        </div>
      </div>
    );
  }
}
