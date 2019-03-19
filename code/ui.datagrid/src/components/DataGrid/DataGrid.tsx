import '../../styles';

import { DefaultSettings } from 'handsontable';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Editor } from '../Editor';
import * as render from '../render';

import {
  constants,
  css,
  events,
  GlamorValue,
  Handsontable as HandsontableLib,
  t,
  value,
} from '../../common';
import { Grid } from '../../api';
import * as hook from './hook';
import { IGridRefsPrivate } from './types.private';
import { FactoryManager } from '../factory';

export type IDataGridProps = {
  totalColumns?: number;
  totalRows?: number;
  values?: t.IGridValues;
  Handsontable?: Handsontable;
  factory?: t.GridFactory;
  events$?: Subject<t.GridEvent>;
  style?: GlamorValue;
};
export type IDataGridState = {
  size?: { width: number; height: number };
};

/**
 * A wrapper around the [Handsontable].
 *
 *    https://handsontable.com/docs
 *    https://github.com/handsontable/handsontable
 *    https://github.com/handsontable/react-handsontable
 *    https://forum.handsontable.com
 *
 */
export class DataGrid extends React.PureComponent<IDataGridProps, IDataGridState> {
  public state: IDataGridState = {};
  public grid!: Grid;
  public factory!: FactoryManager;

  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IDataGridState>>();

  private el!: HTMLDivElement;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);
  private table!: Handsontable;

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentDidMount() {
    const { values } = this.props;

    // Prepare the [handsontable] library.
    const Table = this.props.Handsontable || HandsontableLib;
    render.registerAll(Table);

    // Create the table and corresponding API wrapper.
    const totalColumns = this.totalColumns;
    const totalRows = this.totalRows;
    const table = (this.table = new Table(this.el as Element, this.settings));
    const grid = (this.grid = Grid.create({ table, totalColumns, totalRows, values }));
    this.factory = new FactoryManager({ grid, factory: this.props.factory });
    this.unmounted$.subscribe(() => grid.dispose());

    // Store metadata on the [Handsontable] instance.
    // NOTE:
    //    This is referenced within the [Editor] class.
    const refs: IGridRefsPrivate = {
      grid: grid,
      editorEvents$: new Subject<t.EditorEvent>(),
      factory: this.factory,
    };
    (table as any).__gridRefs = refs;

    // Handle editor events.
    const editor$ = refs.editorEvents$.pipe(takeUntil(this.unmounted$));
    editor$.subscribe(e => this.grid.next(e));

    // Manage size.
    this.updateSize();
    events.resize$.pipe(takeUntil(this.unmounted$)).subscribe(() => this.redraw());

    // Bubble events.
    this.events$.subscribe(e => {
      if (this.props.events$) {
        this.props.events$.next(e);
      }
    });

    // Finish up.
    grid.loadValues();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get events$() {
    return this.grid.events$;
  }

  public get totalColumns() {
    return value.defaultValue(this.props.totalColumns, 100);
  }

  public get totalRows() {
    return value.defaultValue(this.props.totalRows, 1000);
  }

  private get settings(): DefaultSettings {
    const getGrid = () => this.grid;

    const createColumns = (length: number) => {
      return Array.from({ length }).map(() => {
        return {
          renderer: render.CELL_DEFAULT,
          editor: Editor,
        };
      });
    };

    return {
      data: [],
      rowHeaders: true,
      colHeaders: true,
      colWidths: 100,
      columns: createColumns(this.totalColumns),
      viewportRowRenderingOffset: 20,
      manualRowResize: true,
      manualColumnResize: true,
      beforeKeyDown: hook.beforeKeyDownHandler(getGrid),
      beforeChange: hook.beforeChangeHandler(getGrid),
    };
  }

  /**
   * [Methods]
   */

  public redraw() {
    this.updateSize();
    if (this.table) {
      this.table.render();
    }
  }

  /**
   * [Render]
   */

  public render() {
    return (
      <div
        ref={this.elRef}
        className={constants.CSS_CLASS.GRID}
        {...css(STYLES.base, this.props.style)}
      />
    );
  }

  /**
   * [Internal]
   */

  private updateSize() {
    const el = this.el;
    if (el) {
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      const size = { width, height };
      this.state$.next({ size });
    }
  }
}

/**
 * INTERNAL
 */
const STYLES = {
  base: css({
    position: 'relative',
    overflow: 'hidden',
  }),
};
