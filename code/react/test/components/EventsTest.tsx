import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue } from './common';

export type IEventsTestProps = { style?: GlamorValue };
export type IEventsTestState = {};

export class EventsTest extends React.PureComponent<IEventsTestProps, IEventsTestState> {
  public state: IEventsTestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IEventsTestState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        flex: 1,
        padding: 15,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>EventsTest</div>
      </div>
    );
  }
}
