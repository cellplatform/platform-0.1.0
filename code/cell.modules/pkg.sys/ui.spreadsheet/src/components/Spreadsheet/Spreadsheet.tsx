import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t } from '../../common';
// import { DataGrid, Grid } from '@platform/ui.datagrid';

export type SpreadsheetProps = { style?: CssValue };

export const Spreadsheet: React.FC<SpreadsheetProps> = (props) => {
  // const grid = Grid.create({
  //   totalColumns: 52,
  //   totalRows: 1000,
  //   getFunc,
  // keyBindings: [{ command: 'COPY', key: 'CMD+D' }],
  // defaults: { rowHeight: 200 },
  // ns: this.props.data?.ns || SAMPLE.ns,
  // cells: this.props.data?.cells || SAMPLE.cells,
  // columns: this.props.data?.columns || SAMPLE.columns,
  // rows: this.props.data?.rows || SAMPLE.rows,

  //   ns: 'foo',
  //   cells: {},
  //   columns: {},
  //   rows: {},
  // });

  const styles = {
    base: css({
      flex: 1,
      // backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      display: 'flex',
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div></div>
      {/* <DataGrid grid={grid} /> */}
    </div>
  );
};
