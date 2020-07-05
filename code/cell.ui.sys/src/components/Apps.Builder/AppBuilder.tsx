import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, events, t, ui, Uri } from '../../common';
import { Apps } from '../Apps';
import { Installer } from '../Installer';
import { WindowTitleBar } from '../primitives';
import { HelpersCard } from './AppBuilder.Card.Helpers';
import { ServerCard } from './AppBuilder.Card.Server';
import { RootOverlay } from './Root.Overlay';

export type IAppBuilderProps = { style?: CssValue };
export type IAppBuilderState = {};

export class AppBuilder extends React.PureComponent<IAppBuilderProps, IAppBuilderState> {
  public state: IAppBuilderState = {};
  private state$ = new Subject<Partial<IAppBuilderState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const ctx = this.context;
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    // const changes = onStateChanged(ctx.event$, this.unmounted$);
    // changes.on('').subscribe(() => this.forceUpdate());

    // Bubble window resize.
    events.resize$.pipe(takeUntil(this.unmounted$)).subscribe((e) => {
      ctx.fire({
        type: 'UI:DOM/window/resize',
        payload: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    });

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
    const ctx = this.context;
    // const f = ctx.env.def

    console.log('ctx.env.def', ctx.env.def);

    const ns = Uri.toNs(ctx.env.def);
    console.log('ns', ns);

    const def = await ctx.client.sheet(ns);

    console.log('def sheet:', def);
    console.log('types', def.types);

    const info = await def.info();
    console.log('info', info);

    // const app =

    const t = info.ns.type?.implements || '';

    // const f = await ctx.client.sheet(implmements);
    // console.log('f', f);

    console.log('-------------------------------------------');

    const i = await ctx.client.http.ns(t).read({ data: true });
    console.log('implements sheet', i.body.data);
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
      }),
      titlebar: css({
        Absolute: [0, 0, null, 0],
      }),
      body: css({
        Absolute: [WindowTitleBar.HEIGHT, 0, 0, 0],
        display: 'flex',
      }),
      temp: css({
        Absolute: [5, 5, null, null],
      }),
    };

    // const ctx = this.context;
    // const uri = ctx.def;
    const uri = 'system';

    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitleBar style={styles.titlebar} address={uri} />
        <div {...styles.body}>
          {this.renderBody()}
          <RootOverlay />
        </div>
      </div>
    );
  }

  private renderBody() {
    const TOP_MARGIN = 25;
    const EDGE_MARGIN = 30;
    const styles = {
      base: css({
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
        boxSizing: 'border-box',
        backgroundColor: color.format(1),
      }),
      left: css({
        width: 230,
        paddingTop: TOP_MARGIN,
        paddingLeft: EDGE_MARGIN,
        paddingRight: EDGE_MARGIN,
        paddingBottom: 80,
        Scroll: true,
        backgroundColor: color.format(-0.06),
      }),
      center: css({
        flex: 1,
        display: 'flex',
      }),
      right: css({
        width: 250,
        paddingTop: TOP_MARGIN,
        paddingLeft: EDGE_MARGIN,
        paddingRight: EDGE_MARGIN,
        backgroundColor: color.format(-0.06),
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>{this.renderLeft()}</div>
        <div {...styles.center}>{this.renderCenter()}</div>
        <div {...styles.right}>{this.renderRight()} </div>
      </div>
    );
  }

  private renderLeft() {
    return <Apps />;
  }

  private renderCenter() {
    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
        backgroundColor: color.format(1),
      }),
      body: css({
        Absolute: 0,
        overflow: 'auto',
        paddingTop: 30,
        borderLeft: `solid 1px ${color.format(-0.1)}`,
        borderRight: `solid 1px ${color.format(-0.1)}`,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.body}>
          <Installer />
        </div>
      </div>
    );
  }

  private renderRight() {
    const styles = {
      server: css({ marginBottom: 15 }),
      helpers: css({}),
    };
    return (
      <React.Fragment>
        <ServerCard style={styles.server} />
        <HelpersCard style={styles.helpers} />
      </React.Fragment>
    );
  }
}
