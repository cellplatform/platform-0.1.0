import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, t, http } from '../common';
import { loadModule } from '../views';

export type IIndexProps = { views: t.View[]; style?: CssValue };
export type IIndexState = {};

export class Index extends React.PureComponent<IIndexProps, IIndexState> {
  public state: IIndexState = {};
  private state$ = new Subject<Partial<IIndexState>>();
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
        padding: 20,
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
        cursor: 'pointer',
      }),
    };

    const elList = this.props.views.map((view, i) => {
      return (
        <li key={i} {...styles.li}>
          {this.renderListItem({ view })}
        </li>
      );
    });

    return (
      <div {...css(styles.base, this.props.style)}>
        <div>ui.views:</div>
        <ul {...styles.ul}>
          {elList}

          <li onClick={this.tmp} {...styles.li}>
            tmp
          </li>
        </ul>
      </div>
    );
  }

  private renderListItem(props: { view: t.View }) {
    const { view } = props;
    const styles = {
      base: css({}),
    };
    return (
      <div {...styles.base}>
        <div onClick={this.onListItemClick(view)}>{view.name}</div>
      </div>
    );
  }

  private onListItemClick = (view: t.View) => {
    return () => loadModule(view);
  };

  private tmp = async () => {
    const url = 'https://reqres.in/api/users/1';
    console.log('url', url);
    const res = await http.get(url);
    console.log('res.status', res.status);
    console.log('res', res);
    console.log('res.json', res.json);
  };
}
