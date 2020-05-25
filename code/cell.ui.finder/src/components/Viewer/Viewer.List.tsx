import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, COLORS, css, CssValue, t, ui } from '../../common';

export type IViewerListProps = {
  items: IViewerListItem[];
  selectedIndex?: number;
  style?: CssValue;
  onClick?: ViewerItemClickEventHandler;
};
export type IViewerListItem = { filename: string; url: string };
export type IViewerListState = {};

export type ViewerItemClickEvent = { item: IViewerListItem };
export type ViewerItemClickEventHandler = (e: ViewerItemClickEvent) => void;

export class ViewerList extends React.PureComponent<IViewerListProps, IViewerListState> {
  public state: IViewerListState = {};
  private state$ = new Subject<Partial<IViewerListState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: ui.IEnvContext<t.FinderEvent>;

  /**
   * [Lifecycle]
   */
  constructor(props: IViewerListProps) {
    super(props);
  }

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
  public get items() {
    const { items = [] } = this.props;
    return items;
  }

  /**
   * [Render]
   */
  public render() {
    const items = this.items;
    if (items.length === 0) {
      return null;
    }
    const styles = {
      base: css({
        Absolute: 0,
        position: 'relative',
        color: COLORS.DARK,
      }),
      items: css({
        Flex: 'vertical-stretch-stretch',
      }),
      item: css({
        cursor: 'pointer',
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        PaddingY: 8,
        PaddingX: 8,
        fontSize: 13,
        Flex: 'center-start',
        position: 'relative',
        flex: 1,
      }),
      itemInner: css({
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }),
      current: css({
        color: COLORS.BLUE,
      }),
    };

    const elItems = items.map((item, i) => {
      const isCurrent = this.props.selectedIndex === i;
      return (
        <div
          key={i}
          {...css(styles.item, isCurrent && styles.current)}
          onClick={this.itemClickHandler(item)}
        >
          <div {...styles.itemInner}>{item.filename}</div>
        </div>
      );
    });

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.items}>{elItems}</div>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private itemClickHandler = (item: IViewerListItem) => {
    return () => {
      const { onClick } = this.props;
      if (onClick) {
        onClick({ item });
      }
    };
  };
}
