import * as React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList as List } from 'react-window';

import { css, CssValue } from '../../common';
import { VirtualListFactory, VirtualListFactoryArgs, VirtualListItemSize } from './types';

export type IVirtualListProps = {
  factory: VirtualListFactory;
  itemSize?: VirtualListItemSize;
  useIsScrolling?: boolean;
  defaultSize?: number;
  total?: number;
  style?: CssValue;
};

/**
 * A lightweight virtualised scrolling list.
 */
export class VirtualList extends React.PureComponent<IVirtualListProps> {
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
    return (
      <div {...css(this.props.style)}>
        <AutoSizer>{(props) => this.renderList(props)}</AutoSizer>
      </div>
    );
  }

  private renderList(props: { width: number; height: number }) {
    return (
      <List
        width={props.width}
        height={props.height}
        itemCount={this.total}
        itemSize={this.itemSize}
        useIsScrolling={this.props.useIsScrolling}
      >
        {this.renderRow}
      </List>
    );
  }

  /**
   * [Handlers]
   */
  private renderRow = (props: VirtualListFactoryArgs) => {
    return this.props.factory(props);
  };

  private itemSize = (index: number) => {
    const { itemSize, defaultSize } = this.props;
    return itemSize ? itemSize(index) : defaultSize || 30;
  };
}
