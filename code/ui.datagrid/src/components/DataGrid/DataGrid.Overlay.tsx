import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { css, GlamorValue, t, util, constants, createProvider, R } from '../common';

const CSS = constants.CSS;

export type IDataGridOverlayProps = {
  grid: t.IGrid;
  factory: t.GridFactory;
  style?: GlamorValue;
};
export type IDataGridOverlayState = {
  key?: string;
  screen?: t.ICellScreenView;
  Provider?: React.FunctionComponent;
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

    // Redraw when overlay changed.
    command$
      .pipe(
        filter(e => e.command === 'OVERLAY/show'),
        map(e => e as t.IGridOverlayShowCommand),
        filter(e => !R.equals(e.props.screen, this.state.screen)),
      )
      .subscribe(e => {
        const key = e.props.cell;
        const screen = e.props.screen;
        if (key && screen) {
          this.show({ key, screen });
        }
      });

    command$
      .pipe(
        filter(e => e.command === 'OVERLAY/hide'),
        filter(() => this.isShowing),
      )
      .subscribe(e => this.hide());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get isShowing() {
    return Boolean(this.state.screen);
  }

  private get key() {
    return this.state.key as string;
  }

  private get data() {
    return this.getData(this.key);
  }

  public get request() {
    const { screen } = this.state;
    const key = this.key;
    const data = this.data;
    if (!screen || !data || !key) {
      return undefined;
    } else {
      const props = util.toGridCellProps(data.props);
      const view = props.view;
      const req: t.IGridFactoryRequest = {
        type: 'SCREEN',
        grid: this.props.grid,
        cell: { key, data, props },
        view,
      };
      return req;
    }
  }

  /**
   * [Methods]
   */
  public getData(key: string): t.IGridCellData {
    return this.props.grid.data.cells[key] || {};
  }

  public show(args: { key: string; screen: t.ICellScreenView }) {
    const { key, screen } = args;
    const cell = this.getData(key);

    let Provider: React.FunctionComponent | undefined;
    if (cell) {
      const ctx: t.ICellContext = { uri: key, cell };
      Provider = createProvider({ ctx });
    }
    this.state$.next({ key, screen, Provider });
  }

  public hide() {
    this.state$.next({
      key: undefined,
      screen: undefined,
      Provider: undefined,
    });
  }

  /**
   * [Render]
   */
  public render() {
    const req = this.request;
    const { screen, Provider } = this.state;
    const { factory } = this.props;
    if (!req || !screen || !Provider) {
      return null;
    }

    const styles = {
      base: css({
        Absolute: 0,
        display: 'flex',
        backgroundColor: 'rgba(0, 0, 0, 0)', // NB: Invisible click mask, prevent interaction with background grid.
        zIndex: 9999,
      }),
    };

    const className = `${CSS.CLASS.SCREEN.BASE} ${screen.className || ''}`;

    return (
      <div {...css(styles.base, this.props.style)} className={className}>
        <Provider>{factory(req)}</Provider>
      </div>
    );
  }
}
