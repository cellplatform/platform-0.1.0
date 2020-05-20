import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, COLORS, defaultValue } from '../../common';

export type IPropListProps = {
  title?: string;
  items?: (IPropListItem | undefined)[];
  style?: CssValue;
};
export type IPropListState = {};

export type IPropListItem = {
  label: React.ReactNode;
  value?: React.ReactNode;
  tooltip?: string;
};

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
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
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
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.props.title && <div {...styles.title}>{this.props.title}</div>}
        {this.renderItems()}
      </div>
    );
  }

  private renderItems() {
    const { items = [] } = this.props;
    const styles = {
      base: css({
        fontSize: 12,
      }),
      item: css({
        Flex: 'horizontal-center-spaceBetween',
        PaddingY: 4,
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        ':last-child': { border: 'none' },
      }),
      label: css({
        marginRight: 15,
        opacity: 0.4,
        userSelect: 'none',
      }),
      value: css({
        flex: 1,
        textAlign: 'right',
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }),
    };

    const elItems = items
      .filter(item => Boolean(item))
      .map((item, i) => {
        return (
          <div key={i} {...styles.item} title={item?.tooltip}>
            <div {...styles.label}>{item?.label}</div>
            <div {...styles.value}>{item?.value}</div>
          </div>
        );
      });

    return <div {...styles.base}>{elItems}</div>;
  }
}
