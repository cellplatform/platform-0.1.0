import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue } from '../common';
import { Hr } from './Hr';
import { ObjectView } from './ObjectView';
import { events } from '../..';

export type IEventsTestProps = { style?: CssValue };
export type IEventsTestState = { keyPress?: any; mouseDown?: any; focus?: any };

export class EventsTest extends React.PureComponent<IEventsTestProps, IEventsTestState> {
  public state: IEventsTestState = {};
  private unmounted$ = new Subject<void>();
  private state$ = new Subject<Partial<IEventsTestState>>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const unmounted$ = this.unmounted$;
    this.state$.pipe(takeUntil(unmounted$)).subscribe((e) => this.setState(e));

    const keyPress$ = events.keyPress$.pipe(takeUntil(unmounted$));
    const mouseDown$ = events.mouseDown$.pipe(takeUntil(unmounted$));
    const focus$ = events.focus$.pipe(takeUntil(unmounted$));

    focus$.subscribe((e) => this.state$.next({ focus: e }));
    keyPress$.subscribe((e) => this.state$.next({ keyPress: e }));
    mouseDown$.subscribe((e) => {
      const { clientX, clientY } = e;
      this.state$.next({ mouseDown: { clientX, clientY } });
    });
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
        flex: 1,
        padding: 15,
      }),
      inputs: css({
        Flex: 'horizontal',
      }),
      input: css({
        marginRight: 12,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>
          <input type="text" placeholder={'input-1'} {...styles.input} />
          <input type="text" placeholder={'input-2'} {...styles.input} />
        </div>
        <Hr />
        <ObjectView name={'events'} data={this.state} expandLevel={1} />
      </div>
    );
  }
}
