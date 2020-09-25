import * as React from 'react';
import { Subject, merge } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { css, CssValue, events, t, ui, Module } from '../../common';
import { WindowTitlebar, IWindowTitlebarProps } from '../primitives';
import { Shell } from '../../Module';

import { Layout } from '../Body';

type P = t.ShellProps;

export type IWindowProps = {
  module?: t.ShellModule;
  theme?: IWindowTitlebarProps['theme'];
  style?: CssValue;
  onLoaded?: t.ShellLoadedCallbackHandler;
};

export class Window extends React.PureComponent<IWindowProps> {
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IEnvContext;
  private module!: t.ShellModule;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const bus = this.context.bus;

    // Construct module.
    this.module = this.props.module || Shell.module(bus, { acceptNakedRegistrations: true });

    // Bubble window resize.
    events.resize$.pipe(takeUntil(this.unmounted$)).subscribe((e) => {
      bus.fire({
        type: 'UI:DOM/window/resize',
        payload: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    });

    const match: t.ModuleFilterEvent = (e) => e.module === this.module.id;
    const shellEvents = Module.events<P>(
      Module.filter(bus.event$, match),
      merge(this.unmounted$, this.module.dispose$),
    );

    // Redraw on [Shell] module changed.
    shellEvents.changed$.pipe(debounceTime(10)).subscribe((e) => this.forceUpdate());

    // Alert listener.
    if (this.props.onLoaded) {
      this.props.onLoaded(bus);
    }

    // NB: Redraw causes the newly created [module] to be rendered.
    this.forceUpdate();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get data(): t.ShellData {
    return this.module.state.props?.data || { name: '' };
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

    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitlebar style={styles.titlebar} address={this.data.name} theme={this.props.theme} />
        <div {...styles.body}>
          <Layout module={this.module} />
        </div>
      </div>
    );
  }
}
