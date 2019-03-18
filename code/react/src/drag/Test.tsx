import { ObjectView } from '@platform/ui.object';
import * as React from 'react';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { drag } from '.';
import { color, css, GlamorValue } from '../common';

const RED = 'rgba(255, 0, 0, 0.1)';

export type ITestProps = { style?: GlamorValue };
export type ITestState = { event?: drag.IDragPositionEvent };

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestState>>();

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
    const { event } = this.state;
    const left = event ? event.element.x - 10 : 0;
    const top = event ? event.element.y - 10 : 0;

    const styles = {
      base: css({
        position: 'relative',
        userSelect: 'none',
        backgroundColor: RED,
      }),
      target: css({
        display: event ? 'block' : 'none',
        Absolute: [top, null, null, left],
        width: 50,
        height: 50,
        backgroundColor: RED,
        border: `dashed 1px ${color.format(-0.2)}`,
        borderRadius: 4,
        pointerEvents: 'none',
      }),
      footer: css({
        Absolute: [0, null, null, 0],
        fontSize: 11,
        padding: 6,
      }),
    };

    const elEvent = event && <ObjectView data={event} name={'event'} expandLevel={3} />;
    const elInstruction = !event && <div>Click and drag.</div>;

    return (
      <div {...css(styles.base, this.props.style)} onMouseDown={this.handleStart}>
        <div {...styles.target} />
        <div {...styles.footer}>
          {elEvent}
          {elInstruction}
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private handleStart = (e: React.MouseEvent) => {
    const el = e.target as HTMLElement;
    drag
      // Monitor the position throughout the drag operation.
      .position({ el })
      .events$.pipe(map(e => e.toObject()))
      .subscribe(event => this.state$.next({ event }));
  };
}
