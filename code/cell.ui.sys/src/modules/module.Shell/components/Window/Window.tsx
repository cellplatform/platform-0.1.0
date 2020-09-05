import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, events, t, ui } from '../../common';
import { WindowTitlebar, IWindowTitlebarProps } from '../primitives';
import { Shell } from '../../Module';

import { Layout } from '../Body';

export type IWindowProps = {
  module?: t.ShellModule;
  title?: string;
  theme?: IWindowTitlebarProps['theme'];
  style?: CssValue;
  onLoaded?: t.ShellLoadedCallbackHandler;
};

export class Window extends React.PureComponent<IWindowProps> {
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IAppContext;
  private module!: t.ShellModule;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const ctx = this.context;

    // Construct module
    const bus = ctx.bus as t.EventBus;
    this.module = this.props.module || Shell.module(bus);
    this.forceUpdate();

    // Bubble window resize.
    events.resize$.pipe(takeUntil(this.unmounted$)).subscribe((e) => {
      ctx.bus.fire({
        type: 'UI:DOM/window/resize',
        payload: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    });

    // Alert listener.
    if (this.props.onLoaded) {
      this.props.onLoaded(bus);
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    if (!this.module) {
      return null;
    }

    const styles = {
      base: css({ Absolute: 0 }),
      titlebar: css({ Absolute: [0, 0, null, 0] }),
      body: css({
        Absolute: [WindowTitlebar.HEIGHT, 0, 0, 0],
        display: 'flex',
      }),
    };

    const address = this.props.title || 'Untitled';

    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitlebar style={styles.titlebar} address={address} theme={this.props.theme} />
        <div {...styles.body}>
          <Layout module={this.module} />
        </div>
      </div>
    );
  }
}
