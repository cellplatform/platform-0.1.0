import * as React from 'react';

import { CellEditor, css, markdown, t } from '../common';
import { DebugEditor } from '../components/Debug.Editor';
import { MyScreen } from '../components/MyScreen';

/**
 * Factory for generating UI component rendered within the grid.
 */
export const factory: t.GridFactory = req => {
  const cell = req.cell;

  if (req.type === 'EDITOR') {
    return renderEditor(req);
  }

  if (req.type === 'CELL') {
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

  if (req.type === 'SCREEN') {
    return <MyScreen />;
  }

  console.log(`Factory type '${req.type}' not supported by test.`, req);
  return null;
};

/**
 * [Helpers]
 */

function renderEditor(req: t.IGridFactoryRequest) {
  const { editorType = 'default' } = this.props;
  if (editorType === 'default') {
    return <CellEditor />;
  } else {
    return <DebugEditor />;
  }
}

function formatValue(cell: t.IGridCellData) {
  let value = cell.props && cell.props.value ? cell.props.value : cell.value;
  value = typeof value === 'string' && !value.startsWith('=') ? markdown.toHtmlSync(value) : value;
  value = typeof value === 'object' ? JSON.stringify(value) : value;
  return value;
}
