import * as React from 'react';

import { COLORS, css, CssValue, t, value } from '../common';
import { Actions } from './Actions';
import { State } from './State';

export type IPanelProps = {
  total: number;
  actions: t.IStoreEvent[];
  data: object;
  maxActions?: number;
  name?: string;
  expandPaths?: string | string[];
  style?: CssValue;
};

export class Panel extends React.PureComponent<IPanelProps> {
  /**
   * [Properties]
   */

  public get max() {
    return value.defaultValue(this.props.maxActions, 10);
  }

  public get total() {
    return this.props.total || 0;
  }

  public get actions() {
    const MAX = this.max;
    let actions = this.props.actions || [];
    if (this.total > MAX) {
      actions = actions.slice(actions.length - MAX);
    }
    return actions;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        color: COLORS.WHITE,
        minWidth: 280,
        flex: 1,
        Flex: 'vertical',
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderState()}
        <Actions events={this.actions} total={this.total} />
      </div>
    );
  }

  private renderState() {
    const { name, expandPaths, data } = this.props;
    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
      }),
      inner: css({
        Absolute: 0,
        Scroll: true,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.inner}>
          <State name={name} data={data} expandPaths={expandPaths} />
        </div>
      </div>
    );
  }
}
