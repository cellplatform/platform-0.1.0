import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLORS, color, css, CssValue, t } from '../../common';
import * as g from './types';
import { Icons } from '../primitives';

export type IDebugLogItemProps = {
  index: number;
  item: g.IDebugLogItem;
  store: t.IStateObject<g.IDebugLogState>;
  style?: CssValue;
  onClick?: (e: {}) => void;
};
export type IDebugLogItemState = {
  selectedIndex?: number;
};

export class DebugLogItem extends React.PureComponent<IDebugLogItemProps, IDebugLogItemState> {
  public state: IDebugLogItemState = {};
  private state$ = new Subject<Partial<IDebugLogItemState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.store.changed$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.updateState());
    this.updateState();
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
    return this.index === this.state.selectedIndex;
  }

  /**
   * [Methods]
   */

  public updateState() {
    const selectedIndex = this.store.state.selectedIndex;
    this.state$.next({ selectedIndex });
  }

  /**
   * [Render]
   */
  public render() {
    const isSelected = this.isSelected;
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
        color: COLORS.CLI.PURPLE,
        marginLeft: 8,
      }),
    };

    const item = this.item;
    const data = this.data;

    return (
      <div {...css(styles.base, this.props.style)} onMouseDown={this.props.onClick}>
        <div {...styles.body}>
          <div {...styles.left}>
            <Icons.Event size={14} color={COLORS.CLI.PURPLE} />
            <div {...styles.label}>{data.type}</div>
          </div>
          <div {...styles.right}>{item.count}</div>
        </div>
      </div>
    );
  }
}
