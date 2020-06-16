import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, COLORS, defaultValue, t } from '../../common';
import { PropListItem } from './PropList.Item';

export type IPropListProps = {
  title?: string;
  items?: (t.IPropListItem | undefined)[];
  style?: CssValue;
};
export type IPropListState = {};

export class PropList extends React.PureComponent<IPropListProps, IPropListState> {
  public state: IPropListState = {};
  private state$ = new Subject<Partial<IPropListState>>();
  private unmounted$ = new Subject<{}>();

  public static Hr = (props: { color?: string | number } = {}) => {
    const styles = {
      base: css({
        height: 1,
        borderTop: `solid 4px ${color.format(defaultValue(props.color, -0.1))}`,
        MarginY: 15,
      }),
    };
    return <div {...styles.base} />;
  };

  /**
   * [Lifecycle]
   */
  constructor(props: IPropListProps) {
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
   * [Render]
   */
  public render() {
    const { items = [] } = this.props;
    const styles = {
      base: css({
        position: 'relative',
        color: COLORS.DARK,
      }),
      title: css({
        fontWeight: 'bold',
        fontSize: 13,
        marginBottom: 5,
      }),
    };

    const elItems = items
      .filter((item) => Boolean(item))
      .map((item, i) => {
        const isFirst = i === 0;
        const isLast = i === items.length - 1;
        const data = item as t.IPropListItem;
        return <PropListItem key={i} data={data} isFirst={isFirst} isLast={isLast} />;
      });

    return (
      <div {...css(styles.base, this.props.style)}>
        {this.props.title && <div {...styles.title}>{this.props.title}</div>}
        <div>{elItems}</div>
      </div>
    );
  }
}
