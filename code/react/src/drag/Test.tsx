import * as React from 'react';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { drag } from '.';
import { color, css, GlamorValue } from '../common';

const RED = 'rgba(255, 0, 0, 0.1)';
const CLI = {
  WHITE: '#fff',
  BLUE: '#477AF7',
  YELLOW: '#FBC72F',
  MAGENTA: '#FE0064',
  CYAN: '#67D9EF',
  LIME: '#A6E130',
  DARK_RED: '#CB352F',
  PURPLE: '#8F2298',
};

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

    const elEvent = event && this.renderEvent(event);
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

  private renderEvent(e: drag.IDragPositionEvent) {
    const styles = {
      base: css({
        fontSize: 12,
        lineHeight: 1.6,
        color: color.format(-0.6),
        fontFamily: 'monospace',
        fontWeight: 'bold',
      }),
      coord: css({}),
      label: css({}),
      magenta: css({ color: CLI.MAGENTA }),
      blue: css({ color: CLI.BLUE }),
    };

    const coord = (label: string, x: number, y: number) => (
      <div {...styles.coord}>
        <span {...styles.label}>{label}</span> <span {...styles.magenta}>x</span>:
        <span {...styles.blue}>{x}</span> <span {...styles.magenta}>y</span>:
        <span {...styles.blue}>{y}</span>
      </div>
    );

    return (
      <div {...styles.base}>
        <div>
          <span {...styles.label}>type</span> <span {...styles.magenta}>{e.type}</span>
        </div>
        {coord('client', e.client.x, e.client.y)}
        {coord('screen', e.screen.x, e.screen.y)}
        {coord('element', e.element.x, e.element.y)}
        {coord('delta', e.delta.x, e.delta.y)}
        {coord('start', e.start.x, e.start.y)}
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
