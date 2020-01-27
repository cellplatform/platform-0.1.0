import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, t } from '../../common';

export type IViewIndexProps = { style?: CssValue };
export type IViewIndexState = {};

const VIEWS: t.View[] = [
  { name: 'invite 1', load: () => import('../Invite') },
  { name: 'invite 2', load: () => import('../Invite') },
];

export class ViewIndex extends React.PureComponent<IViewIndexProps, IViewIndexState> {
  public state: IViewIndexState = {};
  private state$ = new Subject<Partial<IViewIndexState>>();
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
    const styles = {
      base: css({
        fontSize: 16,
        padding: 30,
        lineHeight: '1.4em',
      }),
      ul: css({
        margin: 0,
        padding: 0,
      }),
      li: css({
        margin: 0,
        padding: 0,
        marginLeft: 30,
      }),
    };

    const elList = VIEWS.map((view, i) => {
      return (
        <li key={i} {...styles.li}>
          {this.renderListItem({ view })}
        </li>
      );
    });

    return (
      <div {...css(styles.base, this.props.style)}>
        <div>Views</div>
        <ul {...styles.ul}>{elList}</ul>
      </div>
    );
  }

  private renderListItem(props: { view: t.View }) {
    const { view } = props;
    const styles = {
      base: css({
        cursor: 'pointer',
      }),
    };
    return (
      <div {...styles.base}>
        <div onClick={this.onListItemClick(view)}>{view.name}</div>
      </div>
    );
  }

  private onListItemClick = (view: t.View) => {
    return () => {
      console.log('click', view);
    };
  };
}
