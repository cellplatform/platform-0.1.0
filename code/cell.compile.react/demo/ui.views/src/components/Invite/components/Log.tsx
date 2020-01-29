import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, COLORS } from '../../../common';

type Item = { id: string; label: string };

export type ILogProps = { style?: CssValue };
export type ILogState = {};

export class Log extends React.PureComponent<ILogProps, ILogState> {
  public state: ILogState = {};
  private state$ = new Subject<Partial<ILogState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: ILogProps) {
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
   * [Properties]
   */
  public get list(): Item[] {
    return Array.from({ length: 4 })
      .map((v, i) => ({
        id: i.toString(),
        label: `transaction-${i + 1}`,
      }))
      .reverse();
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
        Absolute: [0, null, 0, 20],
        borderLeft: `solid 1px ${color.format(0.7)}`,
      }),
      body: css({
        Absolute: 0,
        paddingTop: 30,
        display: 'flex',
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        // Scroll: true,
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

  private renderList(props: { items: Item[] }) {
    const { items = [] } = props;
    const styles = {
      base: css({
        margin: 0,
        padding: 0,
        paddingLeft: 34,
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        alignSelf: 'flex-end',
        flex: 1,
      }),
      li: css({
        marginBottom: 20,
      }),
      detail: css({
        fontSize: 12,
        marginTop: 8,
        opacity: 0.8,
      }),
    };

    const DETAIL =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. ';

    const elItems = items.map((item, i) => {
      return (
        <li key={i} {...styles.li}>
          {item.label}
          <div {...styles.detail}>{DETAIL}</div>
        </li>
      );
    });
    return <ul {...styles.base}>{elItems}</ul>;
  }
}
