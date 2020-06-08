import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, t } from '../../common';
import { DragTargetEvent } from './types';

export type IDragTargetProps = {
  defaultView?: React.ReactNode;
  dragOverView?: React.ReactNode;
  droppedView?: React.ReactNode;
  event$?: Subject<t.DragTargetEvent>;
  style?: CssValue;
};
export type IDragTargetState = {
  isDragOver?: boolean;
  isDropped?: boolean;
};

export class DragTarget extends React.PureComponent<IDragTargetProps, IDragTargetState> {
  public state: IDragTargetState = {};
  private state$ = new Subject<Partial<IDragTargetState>>();
  private unmounted$ = new Subject<{}>();
  private event$ = this.props.event$ || new Subject<t.DragTargetEvent>();

  /**
   * [Lifecycle]
   */
  constructor(props: IDragTargetProps) {
    super(props);
  }

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
        {this.renderBody()}
      </div>
    );
  }

  private renderBody() {
    const { isDragOver, isDropped } = this.state;
    const { dragOverView, droppedView, defaultView } = this.props;

    if (isDragOver && dragOverView) {
      return dragOverView;
    }

    if (isDropped && droppedView) {
      return droppedView;
    }

    return defaultView;
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
        type: 'cell.ui/DragTarget/change',
        payload: {
          event: isDragOver ? 'OVER' : 'LEAVE',
          isDropped,
        },
      });
    };
  };

  private onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    this.state$.next({ isDragOver: false, isDropped: true });
    this.fire({
      type: 'cell.ui/DragTarget/change',
      payload: {
        event: 'DROP',
        isDropped: true,
      },
    });
  };
}
