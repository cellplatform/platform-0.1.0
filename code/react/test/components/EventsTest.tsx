import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, ObjectView } from './common';
import { events } from '../../src';

export type IEventsTestProps = { style?: GlamorValue };
export type IEventsTestState = { keyPress?: any; mouseDown?: any };

export class EventsTest extends React.PureComponent<IEventsTestProps, IEventsTestState> {
  public state: IEventsTestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IEventsTestState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    const keyPress$ = events.keyPress$.pipe(takeUntil(this.unmounted$));
    const mouseDown$ = events.mouseDown$.pipe(takeUntil(this.unmounted$));

    keyPress$.subscribe(e => this.state$.next({ keyPress: e }));
    mouseDown$.subscribe(e =>
      this.state$.next({ mouseDown: { clientX: e.clientX, clientY: e.clientY } }),
    );
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
        <ObjectView name={'events'} data={this.state} expandLevel={1} />
      </div>
    );
  }
}
