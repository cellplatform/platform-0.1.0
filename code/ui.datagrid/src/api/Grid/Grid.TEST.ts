import { expect } from '../../test';
import { DefaultSettings } from 'handsontable';

import { Grid, IGridArgs } from '.';
import { Handsontable, constants, t, util } from '../../common';

export const createTable = () => {
  const el = document.createElement('div');
  const settings: DefaultSettings = {};
  return new Handsontable(el, settings);
};

export const createGrid = (args: Partial<IGridArgs> = {}) => {
  const table = createTable();
  return Grid.create({ ns: 'foo', table, totalColumns: 3, totalRows: 5, ...args });
};

describe('Grid', () => {
  describe('static', () => {
    it('isDefaultValue', () => {
      const defaults = Grid.defaults();
      const test = (kind: t.GridCellType, value: any, expected: boolean) => {
        const res = Grid.isDefaultValue({ defaults, kind, value });
        expect(res).to.eql(expected);
      };

      test('CELL', undefined, true);
      test('CELL', { value: 0 }, false);
      test('CELL', { props: {} }, true);
      test('CELL', { props: { style: { bold: true } } }, false);

      test('COLUMN', undefined, true);
      test('COLUMN', { width: defaults.columnWidth }, true);
      test('COLUMN', { width: 456 }, false);
      test('COLUMN', { foo: true }, false);

      test('ROW', undefined, true);
      test('ROW', { height: defaults.rowHeight }, true);
      test('ROW', { height: 456 }, false);
      test('ROW', { foo: true }, false);
    });
  });

  it('constructs (initialized)', () => {
    const cells = { A1: { value: 123 } };
    const columns = { A: { props: { grid: { width: 200 } } } };
    const rows = { '10': { props: { grid: { height: 200 } } } };
    const ns = 'ns:foo';
    const grid = createGrid({ totalColumns: 10, totalRows: 5, ns, cells, columns, rows });
    expect(grid.isInitialized).to.eql(true);
    expect(grid.isEditing).to.eql(false);
    expect(grid.totalColumns).to.eql(10);
    expect(grid.totalRows).to.eql(5);
    expect(grid.data.ns.id).to.eql('foo'); // NB: the "ns:" uri prefix is stripped.
    expect(grid.data.cells).to.eql(cells);
    expect(grid.data.columns).to.eql(columns);
    expect(grid.data.rows).to.eql(rows);
  });

  it('constructs without table (isInitialized: false)', () => {
    const table = createTable();
    const grid1 = Grid.create({ ns: 'foo', totalColumns: 3, totalRows: 5 });

    expect(grid1.isInitialized).to.eql(false);
    expect(grid1.id).to.eql('');

    const grid2 = grid1.initialize({ table });
    expect(grid2).to.equal(grid1);

    expect(grid1.isInitialized).to.eql(true);
    expect(grid1.id.startsWith('grid/')).to.eql(true);
  });

  it('constructs with given NS identifier', () => {
    const grid1 = Grid.create({ ns: 'foo' });
    const grid2 = Grid.create({ ns: { id: 'foo' } });

    expect(grid1.data.ns.id).to.eql('foo');
    expect(grid2.data.ns.id).to.eql('foo');
  });

  it('dispose', () => {
    const grid = createGrid();
    expect(grid.isDisposed).to.eql(false);

    let count = 0;
    grid.dispose$.subscribe(() => count++);

    grid.dispose();
    grid.dispose();
    grid.dispose();

    expect(grid.isDisposed).to.eql(true);
    expect(count).to.eql(1);
  });

  describe('updateHashes', () => {
    it('force: true', () => {
      let cells = { A1: { value: 123 }, A2: { value: 456 } } as any;
      const grid = createGrid({ cells, ns: 'foo' });
      expect(grid.data.cells).to.eql(cells);

      grid.updateHashes({ force: true });
      cells = grid.data.cells;

      expect(cells.A1.hash).to.eql(
        util.cell.value.hash.cell({ uri: 'cell:foo:A1', data: { value: 123 } }),
      );
      expect(cells.A2.hash).to.eql(
        util.cell.value.hash.cell({ uri: 'cell:foo:A2', data: { value: 456 } }),
      );
    });

    it('force: false (default)', () => {
      let cells = { A1: { value: 123, hash: 'foo' }, A2: { value: 456 } } as any;
      const grid = createGrid({ cells, ns: 'foo' });
      expect(grid.data.cells).to.eql(cells);

      grid.updateHashes();
      cells = grid.data.cells;
      expect(cells.A1.hash).to.eql('foo');
      expect(cells.A2.hash).to.eql(
        util.cell.value.hash.cell({ uri: 'cell:foo:A2', data: { value: 456 } }),
      );
    });
  });

  describe('keyBindings', () => {
    it('default key bindings', () => {
      const grid = createGrid();
      expect(grid.keyBindings).to.eql(constants.DEFAULT.KEY_BINDINGS);
    });

    it('overrides key bindings (merged with defaults)', () => {
      const grid = createGrid({ keyBindings: [{ command: 'PASTE', key: 'Shift+W' }] });
      expect(grid.keyBindings).to.not.eql(constants.DEFAULT.KEY_BINDINGS);

      const paste = grid.keyBindings.find(b => b.command === 'PASTE');
      expect(paste && paste.key).to.eql('Shift+W');
    });
  });

  describe('cell', () => {
    it('from row/column', () => {
      const grid = createGrid();
      const cell = grid.cell({ row: 0, column: 0 });
      expect(cell.row).to.eql(0);
      expect(cell.column).to.eql(0);
      expect(cell.key).to.eql('A1');
    });

    it('from key', () => {
      const grid = createGrid();
      const cell = grid.cell('B5');
      expect(cell.column).to.eql(1);
      expect(cell.row).to.eql(4);
    });
  });

  describe('changeCells', () => {
    it('changes an existing value', () => {
      const grid = createGrid({ cells: { A1: { value: 123 } } });
      const res1 = grid.data.cells;
      expect(res1).to.equal(grid.data.cells);
      expect(res1).to.eql({ A1: { value: 123 } });

      grid.changeCells({ A1: { value: 456 } });
      const res2 = grid.data.cells as any;
      expect(res1).to.not.equal(res2);
      expect(res2.A1.value).to.eql(456);
    });

    it('adds a new value', () => {
      const grid = createGrid({ cells: { A1: { value: 123 } } });
      grid.changeCells({ B1: { value: 'hello' } });
      const cells = grid.data.cells as any;
      expect(cells.A1.value).to.eql(123);
      expect(cells.B1.value).to.eql('hello');
    });

    it('does not store empty cell values', () => {
      const grid = createGrid();
      expect(grid.data.cells).to.eql({});
      grid.changeCells({
        A1: { value: '' },
        A2: { value: undefined },
        A3: { value: undefined, props: {} },
        A4: { value: '', props: {} },
      });
      expect(grid.data.cells).to.eql({});
    });

    it('deletes empty cell values', () => {
      const grid = createGrid({
        cells: {
          A1: { value: 123 },
          A2: { value: 456 },
          A3: { value: 789 },
        },
      });
      expect(Object.keys(grid.data.cells)).to.eql(['A1', 'A2', 'A3']);
      grid.changeCells({
        A1: { value: '', props: {} },
        A2: { value: undefined, props: { style: { bold: true } } }, // NB: Not empty because of props.
        A3: undefined,
      });
      expect(Object.keys(grid.data.cells)).to.eql(['A2']);
    });

    it('does nothing with column/row values', () => {
      const grid = createGrid();
      grid.changeCells({
        A1: { value: 123 },
        '1': { height: 250 }, // Not allowed (stripped off).
        A: { width: 400 }, //    Not allowed (stripped off).
      } as any);
      const cells = grid.data.cells as any;
      expect(Object.keys(cells)).to.eql(['A1']);
      expect(cells.A1.value).to.eql(123);
    });

    it('assigns hash (to changed values)', () => {
      const grid = createGrid({ ns: 'foo', cells: { A1: { value: 123 } } });
      expect(grid.data.cells).to.eql({ A1: { value: 123 } });
      grid.changeCells({ A2: { value: 'hello' } });

      const cells = grid.data.cells as any;
      expect(cells.A1).to.eql({ value: 123 });
      expect(cells.A2.value).to.eql('hello');
      expect(cells.A2.hash).to.eql(
        util.cell.value.hash.cell({ uri: 'cell:foo:A2', data: { value: 'hello' } }),
      );
    });

    it('replaces values (init:true)', () => {
      const grid = createGrid({ cells: { A1: { value: 123 } } });
      grid.changeCells({ A2: { value: 456 } }, { init: true });
      const cells = grid.data.cells as any;
      expect(cells.A1).to.eql(undefined);
      expect(cells.A2.value).to.eql(456);
    });

    it('deletes empty props objects', () => {
      const grid = createGrid({ cells: { A1: { value: 123, props: {} } } });
      let cells = grid.data.cells as any;
      expect(cells.A1.props).to.eql({});

      grid.changeCells({ A1: { value: 456 } });

      cells = grid.data.cells;
      expect(cells.A1.props).to.eql(undefined);
    });
  });

  describe('selection', () => {
    const cells = {
      A1: { value: 123 },
      A2: { value: 456 },
      A3: { value: 789 },
      A5: { value: 'hello' },
    };

    it('no selection', () => {
      const grid = createGrid({ cells });
      const res = grid.selection;
      expect(res.cell).to.eql(undefined);
      expect(res.ranges).to.eql([]);
    });

    it('select: single cell', () => {
      const grid = createGrid({ cells }).select({ cell: 'A1' });
      const res = grid.selection;
      expect(res.cell).to.eql('A1');
    });
  });
});
