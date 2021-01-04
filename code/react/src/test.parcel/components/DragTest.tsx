import * as React from 'react';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { drag } from '../..';
import { color, css, CssValue } from '../common';

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

export type IDragTestProps = { style?: CssValue };
export type IDragTestState = { event?: drag.IDragPositionEvent };

export class DragTest extends React.PureComponent<IDragTestProps, IDragTestState> {
  public state: IDragTestState = {};
  private unmounted$ = new Subject<void>();
  private state$ = new Subject<Partial<IDragTestState>>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
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
        flex: 1,
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
        padding: 10,
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
      undefined: css({ color: color.format(-0.3) }),
    };

    const coord = (label: string, pos?: { x: number; y: number }) => {
      if (!pos) {
        return (
          <div {...styles.coord}>
            <span {...styles.label}>{label}</span> <span {...styles.undefined}>undefined</span>:
          </div>
        );
      }
      return (
        <div {...styles.coord}>
          <span {...styles.label}>{label}</span> <span {...styles.magenta}>x</span>:
          <span {...styles.blue}>{pos.x}</span> <span {...styles.magenta}>y</span>:
          <span {...styles.blue}>{pos.y}</span>
        </div>
      );
    };
    return (
      <div {...styles.base}>
        <div>
          <span {...styles.label}>type</span> <span {...styles.magenta}>{e.type}</span>
        </div>
        {coord('client', e.client)}
        {coord('screen', e.screen)}
        {coord('element', e.element)}
        {coord('delta', e.delta)}
        {coord('start', e.start)}
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private handleStart = (e: React.MouseEvent) => {
    this.state$.next({ event: undefined });
    const el = e.target as HTMLElement;
    drag
      // Monitor the position throughout the drag operation.
      .position({ el })
      .events$.pipe(map((e) => e.toObject()))
      .subscribe((event) => this.state$.next({ event }));
  };
}
