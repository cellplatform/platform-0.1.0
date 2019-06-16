import * as React from 'react';

import { color, css, GlamorValue, t, value, COLORS } from '../common';
import { ObjectView, Text } from './primitives';
import { Actions } from './Actions';
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
    const { total = 0 } = this.props;
    return total;
  }

  public get actions() {
    const MAX = this.max;
    let events = this.props.actions || [];
    if (this.total > MAX) {
      events = events.slice(events.length - MAX);
    }
    return events;
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
          <div {...styles.fill}>
            {this.renderState()}
            {/* <div {...styles.state}>
              <div {...styles.object}>
                <ObjectView name={'state'} theme={'DARK'} data={this.props.data} />
              </div>
            </div> */}
          </div>
        </div>
      </Text>
    );
  }

  private renderActions() {
    const styles = {
      base: css({ flex: 1, Flex: 'vertical' }),
      actionsTitle: css({
        paddingLeft: 10,
        paddingTop: 10,
        paddingBottom: 11,
        opacity: 0.3,
        fontSize: 12,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.actionsTitle}>ACTIONS</div>
        <Actions events={this.actions} total={this.total} direction={'DESC'} />
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
