import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { t, css, color, CssValue } from '../../common';

import { Icons } from '../primitives';

export type IAgendaListProps = {
  items?: t.IAgendaItem[];
  style?: CssValue;
};
export type IAgendaListState = {};

export class AgendaList extends React.PureComponent<IAgendaListProps, IAgendaListState> {
  public state: IAgendaListState = {};
  private state$ = new Subject<Partial<IAgendaListState>>();
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
   * [Render]
   */
  public render() {
    const { items = [] } = this.props;
    const styles = { base: css({}) };

    const elItems = items.map((item, index) => this.renderItem({ item, index }));
    //
    return <div {...css(styles.base, this.props.style)}>{elItems}</div>;
  }

  private renderItem(props: { index: number; item: t.IAgendaItem }) {
    const { index, item } = props;
    const styles = {
      base: css({
        Flex: 'horizontal-start-stretch',
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        PaddingY: 20,
      }),
      icon: css({
        marginLeft: 8,
        marginRight: 15,
        minWidth: 24,
      }),
      detail: css({
        flex: 1,
        fontSize: 14,
        lineHeight: '1.6em',
      }),
    };
    return (
      <div {...styles.base} key={index}>
        <div {...styles.icon}>
          <Icons.Award />
        </div>
        <div {...styles.detail}>{item.detail}</div>
      </div>
    );
  }
}
