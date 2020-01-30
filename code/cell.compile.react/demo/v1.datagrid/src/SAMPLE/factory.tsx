import * as React from 'react';
import { t, css } from '../common';

export const factory: t.GridFactory = req => {
  // if (req.type === 'EDITOR') {
  //   return renderEditor(req);
  // }

  // if (req.type === 'SCREEN') {
  //   return renderScreen(req);
  // }

  if (req.type === 'CELL') {
    return renderCell(req);
  }

  console.log(`Factory type '${req.type}' not supported by test.`, req);
  return null;
};

function renderCell(req: t.IGridFactoryRequest) {
  const cell = req.cell;

  const view = cell.props.view;
  if (view && (!view.cell || !view.cell.type)) {
    // Default view.
    return formatValue(cell.data);
  } else {
    const styles = {
      base: css({
        Absolute: 0,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        fontSize: 11,
        Flex: 'center-center',
      }),
    };
    const type = view && view.cell ? view.cell.type : 'Unknown';
    return <div {...styles.base}>CUSTOM: {type}</div>;
  }
}

/**
 * [Helpers]
 */

function formatValue(cell: t.IGridCellData) {
  let value = cell.props && cell.props.value ? cell.props.value : cell.value;
  // value = typeof value === 'string' && !value.startsWith('=') ? markdown.toHtmlSync(value) : value;
  value = typeof value === 'object' ? JSON.stringify(value) : value;
  return value;
}
