import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLORS, color, css, CssValue } from '../../common';
import { Icons } from '../primitives';

import * as t from './types';

export type IDebugLogItemProps = {
  index: number;
  item: t.IDebugLogItem;
  store: t.IDebugLogWrite;
  style?: CssValue;
  onClick?: () => void;
};

export class LogItem extends React.PureComponent<IDebugLogItemProps> {
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.store.event.changed$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get store() {
    return this.props.store;
  }

  public get index() {
    return this.props.index;
  }

  public get item() {
    return this.props.item;
  }

  public get data() {
    return this.props.item.data;
  }

  public get isSelected() {
    return this.index === this.store.state.selectedIndex;
  }

  public get isEnabled() {
    return this.store.state.isEnabled;
  }

  /**
   * [Methods]
   */

  // public updateState() {
  //   const selectedIndex = this.store.state.selectedIndex;
  //   this.state$.next({ selectedIndex });
  // }

  /**
   * [Render]
   */
  public render() {
    const isSelected = this.isSelected;
    const isEnabled = this.isEnabled;
    const textColor = isEnabled ? COLORS.CLI.PURPLE : color.format(-0.4);
    const styles = {
      base: css({
        position: 'relative',
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        backgroundColor: isSelected ? color.format(-0.03) : undefined,
        userSelect: 'none',
      }),
      body: css({
        padding: 8,
        Flex: 'horizontal-center-spaceBetween',
      }),
      left: css({
        Flex: 'horizontal-center-start',
      }),
      right: css({
        opacity: 0.3,
        fontSize: 11,
      }),
      label: css({
        fontFamily: 'Menlo, monospace',
        fontSize: 11,
        color: textColor,
        marginLeft: 8,
      }),
    };

    const item = this.item;
    const data = this.data;

    return (
      <div {...css(styles.base, this.props.style)} onMouseDown={this.props.onClick}>
        <div {...styles.body}>
          <div {...styles.left}>
            <Icons.Event size={14} color={textColor} />
            <div {...styles.label}>{data.type}</div>
          </div>
          <div {...styles.right}>{item.count}</div>
        </div>
      </div>
    );
  }
}
