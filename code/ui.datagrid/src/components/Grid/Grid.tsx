import '../../styles';

import { DefaultSettings } from 'handsontable';
import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil, share } from 'rxjs/operators';

import {
  constants,
  css,
  events,
  GlamorValue,
  Handsontable as HandsontableLib,
  t,
  value,
  time,
} from '../../common';
import { IGridRefsPrivate } from './types.private';
import { Grid as GridApi } from '../grid.api';

export type IGridSettings = DefaultSettings;

export type IGridProps = {
  style?: GlamorValue;
  settings?: IGridSettings;
  Handsontable?: Handsontable;
  editorFactory?: t.EditorFactory;
  events$?: Subject<t.GridEvent>;
};
export type IGridState = {
  size?: { width: number; height: number };
  isEditing?: boolean;
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
export class Grid extends React.PureComponent<IGridProps, IGridState> {
  public state: IGridState = { isEditing: false };

  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IGridState>>();

  private el: HTMLDivElement;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);
  private table!: Handsontable;

  public api!: GridApi;

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentDidMount() {
    // Create the table.
    const settings = this.settings;
    const Table = this.props.Handsontable || HandsontableLib;
    const table = (this.table = new Table(this.el as Element, settings));
    const api = (this.api = GridApi.create({ table }));
    this.unmounted$.subscribe(() => api.dispose());

    // Store metadata on the [Handsontable] instance.
    // NOTE:
    //    This is referenced within the [Editor] class.
    const refs: IGridRefsPrivate = {
      editorEvents$: new Subject<t.EditorEvent>(),
      editorFactory: () => this.renderEditor(),
    };
    (table as any).__gridRefs = refs;

    // Handle editor events.
    const editor$ = refs.editorEvents$.pipe(takeUntil(this.unmounted$));
    editor$.subscribe(e => this.api.next(e));
    editor$
      .pipe(filter(e => e.type === 'GRID/EDITOR/begin'))
      .subscribe(() => this.state$.next({ isEditing: true }));
    editor$
      .pipe(filter(e => e.type === 'GRID/EDITOR/end'))
      .subscribe(() => this.state$.next({ isEditing: false }));

    // Manage size.
    this.updateSize();
    events.resize$.pipe(takeUntil(this.unmounted$)).subscribe(() => this.redraw());

    // Bubble events.
    this.events$.subscribe(e => {
      if (this.props.events$) {
        this.props.events$.next(e);
      }
    });

    // TEMP 🐷

    time.delay(1500, () => {
      if (this.table) {
        api.scrollTo({ column: 5, row: 650 });
        // console.log('scroll', this.table);
        // this.table.scrollViewportTo(100, 10);
      }
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get events$() {
    return this.api.events$;
  }

  private get settings(): IGridSettings {
    const defaultValue = value.defaultValue;
    let settings = this.props.settings || {};
    settings = {
      ...settings,
      rowHeaders: defaultValue(settings.rowHeaders, true),
      colHeaders: defaultValue(settings.colHeaders, true),
      colWidths: defaultValue(settings.colWidths, 100),
      // columns: createColumns(100),
      viewportRowRenderingOffset: defaultValue(settings.viewportRowRenderingOffset, 20),
      manualRowResize: defaultValue(settings.manualRowResize, true),
      manualColumnResize: defaultValue(settings.manualColumnResize, true),
    };

    return settings;
  }

  public get isEditing() {
    const { isEditing = false } = this.state;
    return isEditing;
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

  private renderEditor() {
    const { editorFactory } = this.props;
    return editorFactory ? editorFactory() : null;
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
