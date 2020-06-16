import * as React from 'react';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue, t, rx } from '../../common';
import { DragTargetEvent } from './types';
import { readDropEvent } from './util';

export type IDragTargetProps = {
  children?: React.ReactNode;
  event$?: Subject<t.DragTargetEvent>;
  style?: CssValue;
};
export type IDragTargetState = {
  isDragOver?: boolean;
  isDropped?: boolean;
};

export class DragTarget extends React.PureComponent<IDragTargetProps, IDragTargetState> {
  public static dropEventToFiles = readDropEvent;
  public static events(event$: Observable<t.DragTargetEvent>, unmounted$?: Observable<{}>) {
    event$ = unmounted$ ? event$.pipe(takeUntil(unmounted$)) : event$;
    const over$ = rx.payload<t.IDragTargetOverEvent>(event$, 'cell.ui/DragTarget/over');
    const drop$ = rx.payload<t.IDragTargetDropEvent>(event$, 'cell.ui/DragTarget/drop');
    return { over$, drop$ };
  }

  public state: IDragTargetState = {};
  private state$ = new Subject<Partial<IDragTargetState>>();
  private unmounted$ = new Subject<{}>();
  private event$ = this.props.event$ || new Subject<t.DragTargetEvent>();

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
    const styles = { base: css({}) };
    return (
      <div
        {...css(styles.base, this.props.style)}
        onDragOver={this.dragHandler(true)}
        onDragLeave={this.dragHandler(false)}
        onMouseLeave={this.dragHandler(false)}
        onDrop={this.onDrop}
      >
        {this.props.children}
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private fire(e: DragTargetEvent) {
    this.event$.next(e);
  }

  private dragHandler = (isDragOver: boolean) => {
    return (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const { isDropped = false } = this.state;
      this.state$.next({ isDragOver });
      this.fire({
        type: 'cell.ui/DragTarget/over',
        payload: { isDragOver, isDropped },
      });
    };
  };

  private onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    this.state$.next({ isDragOver: false, isDropped: true });

    const { dir, files, urls } = await readDropEvent(e);
    this.fire({
      type: 'cell.ui/DragTarget/drop',
      payload: { dir, files, urls },
    });
  };
}
