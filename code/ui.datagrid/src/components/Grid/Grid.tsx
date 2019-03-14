import '../../styles';

import { DefaultSettings } from 'handsontable';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, events, GlamorValue, Handsontable, constants, t, value } from '../../common';

export type IGridSettings = DefaultSettings;

export type IGridProps = {
  style?: GlamorValue;
  settings?: IGridSettings;
  Handsontable?: Handsontable;
  events$?: Subject<t.GridEvent>;
};
export type IGridState = {
  size?: { width: number; height: number };
};

/**
 * A wrapper around the [Handontable].
 *
 *    https://handsontable.com/docs
 *    https://github.com/handsontable/handsontable
 *    https://github.com/handsontable/react-handsontable
 *    https://forum.handsontable.com
 *
 */
export class Grid extends React.PureComponent<IGridProps, IGridState> {
  public state: IGridState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IGridState>>();
  private el: HTMLDivElement;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);
  private table: Handsontable;

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentDidMount() {
    // Setup the default settings.
    let settings = this.props.settings || {};
    settings = {
      ...settings,
      rowHeaders: value.defaultValue(settings.rowHeaders, true),
      colHeaders: value.defaultValue(settings.colHeaders, true),
      colWidths: value.defaultValue(settings.colWidths, 100),
      // columns: createColumns(100),
      viewportRowRenderingOffset: value.defaultValue(settings.viewportRowRenderingOffset, 20),
      manualRowResize: value.defaultValue(settings.manualRowResize, true),
      manualColumnResize: value.defaultValue(settings.manualColumnResize, true),
    };

    // Create the table.
    const Table = this.props.Handsontable || Handsontable;
    this.table = new Table(this.el as Element, settings);

    // Store metadata on the [Handsontable] instance.
    const editorEvents$ = new Subject<t.EditorEvent>();
    this.table.__grid = { editorEvents$ };

    // Handle editor events.
    editorEvents$.pipe(takeUntil(this.unmounted$)).subscribe(e => {
      if (this.props.events$) {
        this.props.events$.next(e); // Bubble event.
      }
    });

    // Manage size.
    this.updateSize();
    events.resize$.pipe(takeUntil(this.unmounted$)).subscribe(() => {
      this.redraw();
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    if (this.table) {
      this.table.destroy();
      this.table = undefined;
    }
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
