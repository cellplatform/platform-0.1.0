import { COLORS } from '@platform/cell.ui/lib/common/constants';
import * as React from 'react';
import { Subject } from 'rxjs';

import { color, css, CssValue, t, ui } from '../../common';
import { Shell } from '../../Module';
import { Sidebar } from './Body.Sidebar';
import { LayoutTree } from './Body.Tree';
import { BodyMain } from './Body.Main';

export type ILayoutProps = {
  module?: t.ShellModule;
  style?: CssValue;
  onLoaded?: t.ShellLoadedCallbackHandler;
};

export class Layout extends React.PureComponent<ILayoutProps> {
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IEnvContext;
  private module!: t.ShellModule;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    // Construct module
    const bus = this.context.bus;
    this.module = this.props.module || Shell.module(bus, { acceptNakedRegistrations: true });

    // NB: Redraw causes the newly created [module] to be rendered.
    this.forceUpdate();

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
    const module = this.module;
    if (!module) {
      return null;
    }
    const bus = this.context.bus;
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'horizontal-stretch-stretch',
        boxSizing: 'border-box',
      }),
      fill: css({ Absolute: 0 }),
      edge: css({
        position: 'relative',
        display: 'flex',
        backgroundColor: color.darken(COLORS.WHITE, 5),
        WebkitAppRegion: 'drag',
        overflow: 'hidden',
      }),
      left: css({ width: 250 }),
      right: css({ width: 250 }),
      main: css({
        flex: 1,
        display: 'flex',
        position: 'relative',
        WebkitAppRegion: 'drag',
        overflow: 'hidden',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...css(styles.edge, styles.left)}>
          <LayoutTree bus={bus} module={module} focusOnLoad={true} />
        </div>
        <div {...styles.main}>
          <BodyMain bus={bus} module={module} style={styles.main} />
        </div>
        <div {...css(styles.edge, styles.right)}>
          <Sidebar bus={bus} module={module} />
        </div>
      </div>
    );
  }
}
