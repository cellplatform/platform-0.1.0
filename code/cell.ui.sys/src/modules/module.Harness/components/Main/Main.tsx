import * as React from 'react';
import { Subject } from 'rxjs';

import { color, css, CssValue, t, ui, defaultValue } from '../../common';
import { Harness } from '../../Module';
import { Tree } from './Main.Tree';

type P = t.HarnessProps;
type V = t.HarnessView;

export type IMainProps = {
  focusOnLoad?: boolean;
  style?: CssValue;
};

export class Main extends React.PureComponent<IMainProps> {
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IEnvContext;
  private harness!: t.HarnessModule;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const ctx = this.context;
    this.harness = Harness.init(ctx.bus);
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

    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'horizontal-stretch-stretch',
        boxSizing: 'border-box',
      }),
      fill: css({
        Absolute: 0,
      }),
      left: css({
        WebkitAppRegion: 'drag',
        position: 'relative',
        display: 'flex',
        width: 250,
        backgroundColor: color.format(1),
      }),
      body: css({
        flex: 1,
        display: 'flex',
        position: 'relative',
      }),
      right: css({
        WebkitAppRegion: 'drag',
        width: 250,
        backgroundColor: color.format(1),
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.left}>
          <Tree harness={harness} focusOnLoad={focusOnLoad} />
        </div>
        <div {...styles.body}>
          <ui.ModuleView.Frame bus={bus} filter={this.bodyFilter} style={styles.fill} />
        </div>
        <div {...styles.right}></div>
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
