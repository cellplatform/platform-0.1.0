import * as React from 'react';
import { Subject } from 'rxjs';

import { color, css, CssValue, t, ui, defaultValue } from '../../common';
import { Harness } from '../../Module';
import { LayoutTree } from './Layout.Tree';
import { COLORS } from '@platform/cell.ui/lib/common/constants';
import { Sidebar } from './Layout.Sidebar';

type P = t.HarnessProps;
type V = t.HarnessView;

export type ILayoutProps = {
  harness?: t.HarnessModule;
  focusOnLoad?: boolean;
  style?: CssValue;
};

export class Layout extends React.PureComponent<ILayoutProps> {
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IEnvContext;
  private harness!: t.HarnessModule;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.harness = this.props.harness || Harness.module(this.context.bus);
    this.forceUpdate(); // NB: Redraw causes the newly created [module] to be rendered.
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get host() {
    return this.harness?.root.props?.data?.host;
  }

  /**
   * [Render]
   */
  public render() {
    const harness = this.harness;
    if (!harness) {
      return null;
    }

    const bus = this.context.bus;
    const focusOnLoad = defaultValue(this.props.focusOnLoad, true);
    const main: t.HarnessTarget = 'Main';

    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'horizontal-stretch-stretch',
        boxSizing: 'border-box',
      }),
      fill: css({
        Absolute: 0,
      }),
      edge: css({
        position: 'relative',
        display: 'flex',
        backgroundColor: color.darken(COLORS.WHITE, 5),
        WebkitAppRegion: 'drag',
        overflow: 'hidden',
      }),
      left: css({
        width: 250,
      }),
      right: css({
        width: 250,
      }),
      body: css({
        flex: 1,
        display: 'flex',
        position: 'relative',
        borderLeft: `solid 10px ${color.format(0.1)}`,
        borderRight: `solid 10px ${color.format(0.1)}`,
        WebkitAppRegion: 'drag',
        overflow: 'hidden',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...css(styles.edge, styles.left)}>
          <LayoutTree harness={harness} focusOnLoad={focusOnLoad} />
        </div>
        <div {...styles.body}>
          <ui.ModuleView.Frame
            bus={bus}
            filter={this.bodyFilter}
            style={styles.fill}
            target={main}
          />
        </div>
        <div {...css(styles.edge, styles.right)}>
          <Sidebar bus={bus} harness={harness} />
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private bodyFilter: t.ModuleFilterView<V> = (e) => {
    return e.module === this.harness.id;
  };
}
