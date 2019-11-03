import * as React from 'react';

import { color, CellEditor, css, markdown, t, datagrid } from '../common';
import { DebugEditor } from '../components/Debug.Editor';
import { MyScreen } from '../components/MyScreen';
import { TestGridView } from '../components/Test.Grid.view';

/**
 * Factory for generating UI component rendered within the grid.
 */
export const factory: t.GridFactory = req => {
  if (req.type === 'EDITOR') {
    return renderEditor(req);
  }

  if (req.type === 'SCREEN') {
    return renderScreen(req);
  }

  if (req.type === 'CELL') {
    return renderCell(req);
  }

  console.log(`Factory type '${req.type}' not supported by test.`, req);
  return null;
};

/**
 * [Renderers]
 */
function renderEditor(req: t.IGridFactoryRequest) {
  console.log(`\nTODO 🐷  extend [cell.props.view].editor \n`);
  return <CellEditor />;
  // const { editorType = 'default' } = this.props;
  // if (editorType === 'default') {
  //   return <CellEditor />;
  // } else {
  //   return <DebugEditor />;
  // }
}

function renderScreen(req: t.IGridFactoryRequest) {
  // req.v
  console.group('🌳 renderScreen');

  console.log('req', req);
  console.log('req.view', req.view);
  console.groupEnd();

  const type = req.view.screen ? req.view.screen.type : 'DEFAULT';

  if (type === 'GRID') {
    const grid = datagrid.Grid.create({});

    const styles = {
      base: css({
        // Absolute: 0,
        flex: 1,
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        display: 'flex',
      }),
      grid: css({ Absolute: 20, border: `solid 1px ${color.format(-0.2)}` }),
    };

    return (
      <div {...styles.base}>
        <TestGridView grid={grid} style={styles.grid} />
      </div>
    );

    // return <TestGridView grid={grid} />;
  } else {
    return <MyScreen />;
  }
}

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
  value = typeof value === 'string' && !value.startsWith('=') ? markdown.toHtmlSync(value) : value;
  value = typeof value === 'object' ? JSON.stringify(value) : value;
  return value;
}
