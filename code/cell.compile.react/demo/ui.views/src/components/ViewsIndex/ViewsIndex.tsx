import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { log, css, color, CssValue, t } from '../../common';

export type IViewsIndexProps = { views: t.View[]; style?: CssValue };
export type IViewsIndexState = {};

export class ViewsIndex extends React.PureComponent<IViewsIndexProps, IViewsIndexState> {
  public state: IViewsIndexState = {};
  private state$ = new Subject<Partial<IViewsIndexState>>();
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
    return async () => {
      try {
        log.info('loading view:', view.name);
        const res = await view.load();
        log.info('loaded', res);

        const el = <res.default />;
        ReactDOM.render(el, document.getElementById('root'));
      } catch (error) {
        console.log('error', error);
      }
    };
  };
}
