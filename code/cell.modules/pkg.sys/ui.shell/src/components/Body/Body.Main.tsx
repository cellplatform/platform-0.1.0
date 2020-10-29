import * as React from 'react';

import { color, css, CssValue, t, ui } from '../../common';

type P = t.ShellProps;
type V = t.ShellView;

export type IBodyMainProps = {
  bus: t.EventBus;
  module: t.ShellModule;
  style?: CssValue;
};

export class BodyMain extends React.PureComponent<IBodyMainProps> {
  public static contextType = ui.Context;
  public context!: t.IEnvContext;

  /**
   * [Properties]
   */
  public get module() {
    return this.props.module;
  }

  public get selected() {
    return this.module.state.props?.treeview?.nav?.selected;
  }

  /**
   * [Render]
   */
  public render() {
    const bus = this.context.bus;
    const main: t.ShellRegion = 'Main';
    const styles = {
      base: css({ Absolute: 0 }),
      fill: css({ Absolute: 0 }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderGlassBevels()}
        <ui.ModuleView.Frame bus={bus} filter={this.mainFilter} style={styles.fill} region={main} />
      </div>
    );
  }

  private renderGlassBevels() {
    const styles = {
      base: css({
        width: 10,
        backgroundColor: color.format(0.1),
      }),
      left: css({ Absolute: [0, null, 0, 0] }),
      right: css({ Absolute: [0, 0, 0, null] }),
    };
    return (
      <React.Fragment>
        <div {...css(styles.base, styles.left)} />
        <div {...css(styles.base, styles.right)} />
      </React.Fragment>
    );
  }

  /**
   * [Handlers]
   */

  private mainFilter: t.ModuleFilterView<V> = (e) => {
    return this.selected === e.module;
  };
}
