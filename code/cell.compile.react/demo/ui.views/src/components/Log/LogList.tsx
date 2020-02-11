import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, COLORS, R, time, t } from '../../common';

export type ILogListProps = {
  items: t.ILogItem[];
  style?: CssValue;
};
export type ILogState = {};

export class LogList extends React.PureComponent<ILogListProps, ILogState> {
  public state: ILogState = {};
  private state$ = new Subject<Partial<ILogState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get list(): t.ILogItem[] {
    const { items = [] } = this.props;
    return R.sortBy(R.prop('date'), items);
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        color: COLORS.DARK,
        fontSize: 14,
      }),
      margin: css({
        Absolute: [0, null, 0, 19],
        borderLeft: `solid 1px ${color.format(0.7)}`,
      }),
      body: css({
        Absolute: 0,
        paddingTop: 30,
        display: 'flex',
      }),
    };
    const items = this.list;
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.margin} />
        <div {...styles.body}>{this.renderList({ items })}</div>
      </div>
    );
  }

  private renderList(props: { items: t.ILogItem[] }) {
    const { items = [] } = props;
    const styles = {
      base: css({
        margin: 0,
        padding: 0,
        paddingLeft: 34,
        paddingRight: 10,
        alignSelf: 'flex-end',
        flex: 1,
        color: COLORS.WHITE,
      }),
      li: css({
        marginBottom: 28,
        fontSize: 17,
      }),
      liBody: css({
        color: COLORS.DARK,
      }),
      title: css({
        fontSize: 13,
        fontWeight: 'bold',
      }),
      detail: css({
        fontSize: 13,
        marginTop: 5,
      }),
      date: css({
        fontSize: 10,
        marginTop: 5,
        opacity: 0.7,
      }),
    };

    const elItems = items.map((item, i) => {
      const date = time.day(item.date).format('h:mma D MMM YYYY');
      return (
        <li key={i} {...styles.li}>
          <div {...styles.liBody}>
            <div {...styles.title}>{item.title}</div>
            <div {...styles.detail}>{item.detail}</div>
            <div {...styles.date}>logged: {date}</div>
          </div>
        </li>
      );
    });
    return <ul {...styles.base}>{elItems}</ul>;
  }
}
