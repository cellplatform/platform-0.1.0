import * as React from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';

import { css, GlamorValue, R, t } from '../../common';

export type IDataGridOverlayProps = {
  grid: t.IGrid;
  factory: t.GridFactory;
  style?: GlamorValue;
};
export type IDataGridOverlayState = {
  screen?: t.ICellScreenView;
};

export class DataGridOverlay extends React.PureComponent<
  IDataGridOverlayProps,
  IDataGridOverlayState
> {
  public state: IDataGridOverlayState = {};
  private state$ = new Subject<Partial<IDataGridOverlayState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const { grid } = this.props;

    // Manage state.
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    // Setup observables.
    const events$ = grid.events$.pipe(takeUntil(this.unmounted$));
    const command$ = events$.pipe(
      filter(e => e.type === 'GRID/command'),
      map(e => e.payload as t.IGridCommand),
    );
    const overlay$ = command$.pipe(
      filter(e => e.command === 'OVERLAY'),
      map(e => e as t.IGridOverlayCommand),
    );

    // Redraw when overlay changed.
    overlay$
      .pipe(distinctUntilChanged((prev, next) => R.equals(prev.props.screen, next.props.screen)))
      .subscribe(e => {
        console.group('🌳 OVERLAY.tsx');
        console.log('e', e);
        console.log('grid.overlay', grid.overlay);
        console.groupEnd();
        this.updateState();
      });

    // Finish up.
    this.updateState();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Methods]
   */
  public updateState() {
    const { grid } = this.props;
    const screen = grid.overlay;
    this.state$.next({ screen });
  }

  /**
   * [Render]
   */
  public render() {
    const { screen } = this.state;
    if (!screen) {
      return null;
    }

    const styles = {
      base: css({
        Absolute: 0,
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        zIndex: 9999,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>DataGridOverlay</div>
      </div>
    );
  }
}
