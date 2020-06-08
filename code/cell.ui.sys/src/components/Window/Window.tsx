import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { css, color, CssValue, R } from '../../common';
import { DragTarget, DragTargetEvent } from '@platform/cell.ui/lib/components/DragTarget';

export type WindowEvent = DragTargetEvent;

export type IWindowProps = {
  event$?: Subject<WindowEvent>;
  style?: CssValue;
};
export type IWindowState = {};

export class Window extends React.PureComponent<IWindowProps, IWindowState> {
  public state: IWindowState = {};
  private state$ = new Subject<Partial<IWindowState>>();
  private unmounted$ = new Subject<{}>();
  private event$ = this.props.event$ || new Subject<WindowEvent>();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    const event$ = this.event$.pipe(takeUntil(this.unmounted$));

    /**
     * TODO 🐷
     */
    event$.pipe(distinctUntilChanged((prev, next) => R.equals(prev, next))).subscribe((e) => {
      console.log('e', e);
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
        Absolute: 0,
        WebkitAppRegion: 'drag',
        userSelect: 'none',
        display: 'flex',
      }),
      dragTarget: css({
        flex: 1,
        Flex: 'center-center',
      }),
      label: css({
        fontWeight: 'bolder',
        fontSize: 24,
        letterSpacing: -0.8,
        color: color.format(0.8),
        cursor: 'default',
      }),
    };

    const elDefault = <div {...styles.label}>Drag to add Application</div>;
    const elOver = <div>Over</div>;
    const elDropped = <div>Dropped</div>;

    return (
      <div {...css(styles.base, this.props.style)}>
        <DragTarget
          style={styles.dragTarget}
          defaultView={elDefault}
          dragOverView={elOver}
          droppedView={elDropped}
          event$={this.event$}
        />
      </div>
    );
  }
}
