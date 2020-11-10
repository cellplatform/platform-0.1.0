import * as React from 'react';

import { css, CssValue, t, value } from '../common';
import { Action } from './Action'; // eslint-disable-line

export type IActionsProps = {
  events: t.IStoreEvent[];
  total?: number;
  direction?: 'ASC' | 'DESC';
  style?: CssValue;
};

export class Actions extends React.PureComponent<IActionsProps> {
  /**
   * [Render]
   */
  public render() {
    const { direction = 'ASC' } = this.props;
    const styles = {
      base: css({}),
    };
    const { events = [] } = this.props;
    const total = value.defaultValue(this.props.total, events.length);
    const start = Math.max(0, total - events.length);

    let elList = events.map((e, i) => {
      const index = start + i;
      return <Action key={index} event={e} index={index} />;
    });

    elList = direction === 'DESC' ? elList.reverse() : elList;

    return <div {...css(styles.base, this.props.style)}>{elList}</div>;
  }
}
