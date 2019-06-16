import * as React from 'react';

import { color, COLORS, css, GlamorValue, t, value } from '../common';
import { Actions } from './Actions';
import { Text } from './primitives';
import { State } from './State';

export type ISplitPanelProps = {
  total: number;
  actions: t.IStoreEvent[];
  data: object;
  maxActions?: number;
  name?: string;
  expandPaths?: string | string[];
  style?: GlamorValue;
};

export class SplitPanel extends React.PureComponent<ISplitPanelProps> {
  /**
   * [Properties]
   */
  public get max() {
    return value.defaultValue(this.props.maxActions, 50);
  }

  public get total() {
    return this.props.total ||0
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
        position: 'relative',
        Flex: 'horizontal-stretch-stretch',
        flex: 1,
      }),
      fill: css({
        Absolute: 0,
        display: 'flex',
      }),
      left: css({
        flex: 1.5,
        minWidth: 200,
        position: 'relative',
        borderRight: `solid 1px ${color.format(0.1)}`,
        Scroll: true,
      }),
      right: css({
        flex: 2,
        position: 'relative',
        padding: 10,
        Scroll: true,
      }),
    };

    return (
      <Text style={css(styles.base, this.props.style)}>
        <div {...styles.left} className={'events'}>
          <div {...css(styles.fill)}>{this.renderActions()}</div>
        </div>
        <div {...styles.right}>
          <div {...styles.fill}>{this.renderState()}</div>
        </div>
      </Text>
    );
  }

  private renderActions() {
    const styles = {
      base: css({ flex: 1, Flex: 'vertical' }),
      title: css({
        paddingLeft: 10,
        paddingTop: 10,
        paddingBottom: 11,
        opacity: 0.3,
        fontSize: 12,
        fontWeight: 'bold',
      }),
      empty: css({
        opacity: 0.3,
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
        borderTop: `solid 1px ${color.format(0.3)}`,
        paddingTop: 10,
      }),
    };

    const actions = this.actions;
    const isEmpty = actions.length === 0;
    const elEmpty = isEmpty && <div {...styles.empty}>Nothing to display</div>;
    const elActions = !isEmpty && (
      <Actions events={this.actions} total={this.total} direction={'DESC'} />
    );

    return (
      <div {...styles.base}>
        <div {...styles.title}>ACTIONS</div>
        {elEmpty}
        {elActions}
      </div>
    );
  }

  private renderState() {
    const styles = {
      base: css({ flex: 1 }),
      object: css({
        position: 'relative',
        padding: 10,
        paddingBottom: 30,
        paddingLeft: 14,
      }),
    };
    return (
      <div {...styles.base}>
        <State data={this.props.data} name={this.props.name} expandPaths={this.props.expandPaths} />
      </div>
    );
  }
}
