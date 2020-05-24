import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, t } from '../../common';
import { Switch } from '../primitives';

export type IPropListItemProps = {
  data: t.IPropListItem;
  isFirst?: boolean;
  isLast?: boolean;
  style?: CssValue;
};
export type IPropListItemState = {};

export class PropListItem extends React.PureComponent<IPropListItemProps, IPropListItemState> {
  public state: IPropListItemState = {};
  private state$ = new Subject<Partial<IPropListItemState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IPropListItemProps) {
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
    const { data: item, isLast } = this.props;

    const styles = {
      base: css({
        Flex: 'horizontal-center-spaceBetween',
        PaddingY: 4,
        borderBottom: `solid 1px ${color.format(isLast ? 0 : -0.1)}`,
        ':last-child': { border: 'none' },
        fontSize: 12,
      }),
    };
    return (
      <div {...styles.base} title={item.tooltip}>
        {this.renderLabel()}
        {this.renderValue()}
      </div>
    );
  }

  private renderLabel() {
    const { data } = this.props;
    const styles = {
      base: css({
        marginRight: 15,
        opacity: 0.4,
        userSelect: 'none',
      }),
    };
    return <div {...styles.base}>{data.label}</div>;
  }

  private renderValue() {
    const { data } = this.props;
    const styles = {
      base: css({
        flex: 1,
        textAlign: 'right',
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }),
    };

    const value = data.value;
    const el = typeof value === 'boolean' ? <Switch height={16} value={value} /> : value;

    return <div {...styles.base}>{el}</div>;
  }
}
