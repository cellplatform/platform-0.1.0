import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { color, css, CssValue, t, rx } from '../common';
import { DragTarget } from '@platform/cell.ui/lib/components/DragTarget';

export type IFinderImageProps = { style?: CssValue };
export type IFinderImageState = { elOver?: JSX.Element };

export class FinderImage extends React.PureComponent<IFinderImageProps, IFinderImageState> {
  public state: IFinderImageState = {};
  private state$ = new Subject<Partial<IFinderImageState>>();
  private unmounted$ = new Subject<void>();

  private drag$ = new Subject<t.DragTargetEvent>();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    const drag$ = this.drag$.pipe(takeUntil(this.unmounted$));

    rx.payload<t.IDragTargetOverEvent>(drag$, 'cell.ui/DragTarget/over').subscribe((e) => {
      console.log('over', e);
      const elOver = e.isDragOver ? this.renderDragTargetOver() : undefined;
      this.state$.next({ elOver });
    });

    rx.payload<t.IDragTargetDropEvent>(drag$, 'cell.ui/DragTarget/drop').subscribe((e) => {
      console.log('drop', e);
      this.state$.next({ elOver: undefined });
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get isDragOver() {
    return Boolean(this.state.elOver);
  }

  /**
   * [Render]
   */
  public render() {
    const isDragOver = this.isDragOver;
    const styles = {
      base: css({
        position: 'relative',
      }),
    };

    const elTarget = this.renderDragTarget();
    const elHint = !isDragOver && this.renderDragHint();

    return (
      <div {...css(styles.base, this.props.style)}>
        {elHint}
        {elTarget}
        {this.state.elOver}
      </div>
    );
  }

  private renderDragHint() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'center-center',
      }),
      hint: css({
        opacity: 0.3,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.hint}>Drag Image</div>
      </div>
    );
  }

  private renderDragTarget() {
    const styles = {
      base: css({
        Absolute: 0,
      }),
    };
    return <DragTarget style={styles.base} event$={this.drag$} />;
  }

  private renderDragTargetOver() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'center-center',
        pointerEvents: 'none',
      }),
      border: css({
        Absolute: [30, 30, 30, 30],
        border: `dashed 5px ${color.format(-0.08)}`,
        borderRadius: 30,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.border} />
        <div>Drag Over</div>
      </div>
    );
  }
}
