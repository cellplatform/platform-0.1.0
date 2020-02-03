import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, client, Client, http, COLORS, Spinner, Button } from '../../common';

import { Avatar } from '@platform/ui.image';
import { Log } from './components/Log';

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
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Methods]
   */

  private tmp = async () => {
    // console.log('client', client);

    const host = 'localhost:8080';
    const uri = 'cell:ck5st4aop0000ffet9pi2fkvp!B1';

    const client = Client.create(host);
    const cellClient = client.cell(uri);

    console.log('client', client);

    // client.

    // const url = 'https://dev.db.team/cell:ck5st4aop0000ffet9pi2fkvp!B1';
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
  };

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
        maxWidth: 500,
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
            {/* <div>Dinner</div> */}
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
        {this.renderLog()}
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
      bottom: css({
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        Absolute: [0, 0, null, 0],
      }),
    };

    console.log('Button', Button);

    return (
      <div {...styles.base}>
        <div {...styles.topShadow} />
        <div {...styles.bgMask} />
        <div {...styles.body}>
          {/* <Spinner size={32} color={1} /> */}
          {this.renderAvatars()}

          <div {...styles.bottom}>
            <div>
              <Button onClick={this.tmp}>Click me</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderAvatars() {
    const styles = {
      base: css({
        Flex: 'horizontal-center-center',
      }),
      divider: css({
        width: 120,
        border: `solid 2px ${color.format(1)}`,
      }),
      dividerLeft: css({
        width: 6,
        marginRight: 4,
      }),
      dividerRight: css({}),
    };
    const phil = 'https://s.gravatar.com/avatar/99d0b4f26c68a563507c9e5a3d724126?s=80';
    const nic = 'https://dev.db.team/cell:ck5st4aop0000ffet9pi2fkvp!B1/file:ck10bc6.png';
    return (
      <div {...styles.base}>
        {this.renderAvatar({ src: phil })}

        <div {...css(styles.divider, styles.dividerLeft)} style={{ width: 3 }} />
        <div {...css(styles.divider, styles.dividerLeft)} />
        <div {...css(styles.divider, styles.dividerRight)} />

        {this.renderAvatar({ src: nic })}
      </div>
    );
  }

  private renderAvatar(props: { src: string; size?: number }) {
    const { src, size = 55 } = props;
    const styles = {
      base: css({ MarginX: 8 }),
    };
    return (
      <Avatar
        style={styles.base}
        src={src}
        size={size}
        borderRadius={size / 2}
        borderColor={0.1}
        borderWidth={6}
      />
    );
  }

  private renderLog() {
    const styles = {
      base: css({
        Absolute: [0, 0, 0, null],
        width: 300,
        backgroundColor: color.format(0.6),
        // Scroll: true,
        // overflow: 'auto',
      }),
      log: css({
        Absolute: 0,
        // Scroll: true,
      }),
      bevel: css({
        Absolute: [0, null, 0, -10],
        width: 10,
        backgroundColor: color.format(0.15),
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.bevel} />
        <Log style={styles.log} />
      </div>
    );
  }
}
