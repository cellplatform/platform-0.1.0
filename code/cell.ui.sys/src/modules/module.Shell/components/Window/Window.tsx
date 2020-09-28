import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { css, CssValue, events as globalEvents, Module, t, ui } from '../../common';
import { Shell } from '../../Module';
import { Layout } from '../Body';
import { IWindowTitlebarProps, WindowTitlebar } from '../primitives';

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
    const ctx = this.context;
    const bus = ctx.bus.type<t.ShellEvent>();

    // Construct module.
    this.module = this.props.module || Shell.module(ctx.bus, { acceptNakedRegistrations: true });

    // Bubble window resize.
    globalEvents.resize$.pipe(takeUntil(this.unmounted$)).subscribe((e) => {
      bus.fire({
        type: 'Shell/window/resize',
        payload: { width: window.innerWidth, height: window.innerHeight },
      });
    });

    const match: t.ModuleFilterEvent = (e) => e.module === this.module.id;
    const events = Module.events<P>(Module.filter(ctx.bus.event$, match), [
      this.unmounted$,
      this.module.dispose$,
    ]);

    // Redraw on [Shell] module changed.
    events.changed$.pipe(debounceTime(10)).subscribe(() => this.forceUpdate());

    // Alert listener.
    if (this.props.onLoaded) {
      this.props.onLoaded(ctx.bus);
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
