import * as React from 'react';

import { css, GlamorValue, t, util, constants } from '../common';
const CSS = constants.CSS;

export type IDataGridScreenProps = {
  grid: t.IGrid;
  factory: t.GridFactory;
  screenCell?: string;
  style?: GlamorValue;
};

export class DataGridScreen extends React.PureComponent<IDataGridScreenProps> {
  /**
   * [Properties]
   */
  public get view() {
    const { grid } = this.props;
    const key = this.props.screenCell as string;
    const cell = key ? grid.data.cells[key] : undefined;
    const props = cell ? util.toGridCellProps(cell.props) : undefined;
    const screen = props && props.view ? props.view.screen : undefined;
    return screen && cell && key ? { key, screen, cell } : undefined;
  }

  public get ctx() {
    const view = this.view;
    if (!view) {
      return undefined;
    } else {
      const key = view.key;
      const data = view.cell;
      const props = util.toGridCellProps(data.props);
      const req: t.IGridFactoryRequest = {
        type: 'SCREEN',
        grid: this.props.grid,
        cell: { key, data, props },
      };
      return { req, view };
    }
  }

  /**
   * [Render]
   */
  public render() {
    const { factory } = this.props;
    const ctx = this.ctx;
    if (!ctx) {
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

    const className = `${CSS.CLASS.SCREEN.BASE} ${ctx.view.screen.className || ''}`;

    return (
      <div {...css(styles.base, this.props.style)} className={className}>
        {factory(ctx.req)}
      </div>
    );
  }
}
