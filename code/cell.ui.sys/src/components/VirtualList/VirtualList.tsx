import * as React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList as List } from 'react-window';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue } from '../../common';
import { VirtualListFactory, VirtualListFactoryArgs, VirtualListItemSize } from './types';

export type IVirtualListProps = {
  factory: VirtualListFactory;
  itemSize?: VirtualListItemSize;
  defaultSize?: number;
  total?: number;
  style?: CssValue;
};
export type IVirtualListState = {};

/**
 * A virtualised scrolling list.
 */
export class VirtualList extends React.PureComponent<IVirtualListProps, IVirtualListState> {
  public state: IVirtualListState = {};
  private state$ = new Subject<Partial<IVirtualListState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get total() {
    return this.props.total || 0;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        borderBottom: `solid 1px ${color.format(-0.1)}`,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <AutoSizer>
          {(props) => {
            return (
              <List
                width={props.width}
                height={props.height}
                itemCount={this.total}
                itemSize={this.itemSize}
              >
                {this.renderRow}
              </List>
            );
          }}
        </AutoSizer>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private renderRow = (props: VirtualListFactoryArgs) => this.props.factory(props);

  private itemSize = (index: number) => {
    const { itemSize, defaultSize } = this.props;
    return itemSize ? itemSize(index) : defaultSize || 30;
  };
}
