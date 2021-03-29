import * as React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList as List, areEqual, shouldComponentUpdate } from 'react-window';

import { css, CssValue } from '../../common';
import * as t from './types';

export type IVirtualListProps = {
  factory: t.VirtualListFactory;
  itemSize?: t.VirtualListItemSize;
  useIsScrolling?: boolean;
  defaultSize?: number;
  total?: number;
  style?: CssValue;
};

/**
 * A lightweight virtualised scrolling list.
 */
export class VirtualList extends React.PureComponent<IVirtualListProps> {
  public static areEqual = areEqual;
  public static shouldComponentUpdate = shouldComponentUpdate;

  private list = React.createRef<List>();

  /**
   * [Properties]
   */
  public get total() {
    return this.props.total || 0;
  }

  /**
   * [Methods]
   */
  public scrollTo(index: number, align: t.VirtualListAlign = 'auto') {
    this.list.current?.scrollToItem(index, align);
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
        ref={this.list}
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
  private renderRow = (props: t.VirtualListFactoryArgs) => {
    return this.props.factory(props);
  };

  private itemSize = (index: number) => {
    const { itemSize, defaultSize } = this.props;
    return itemSize ? itemSize(index) : defaultSize || 30;
  };
}
