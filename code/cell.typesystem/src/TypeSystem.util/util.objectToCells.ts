import { coord, t } from '../common';
import { TypeTarget } from '../TypeSystem.core/TypeTarget';

/**
 * Converts typed data-objects to cells.
 */
export function objectToCells<T>(input: t.ITypeDef[] | t.INsTypeDef) {
  const types = Array.isArray(input) ? input : input?.columns || [];
  const api = {
    /**
     * Construct a CellMap row from the given data-object.
     */
    row(index: number, data: T): t.ICellMap {
      const cells: t.ICellMap = {};
      Object.keys(data)
        .map(key => {
          const value = data[key];
          const type = types.find(type => type.prop === key) as t.IColumnTypeDef;
          return { key, value, type };
        })
        .filter(({ type }) => Boolean(type))
        .forEach(({ value, type }) => {
          const target = TypeTarget.parse(type.target);
          const cell: t.ICellData = {};
          if (target.path === 'value') {
            cell.value = value;
          }
          if (target.path.startsWith('props:')) {
            const path = target.path.substring('props:'.length);
            cell.props = cell.props || {};
            cell.props[path] = value;
          }
          const pos = coord.cell.toCell(`${type.column}${index + 1}`);
          cells[pos.key] = cell;
        });

      return cells;
    },

    /**
     * Construct CellMap of multiple rows from the given list of data-objects.
     */
    rows(index: number, items: T[]): t.ICellMap {
      let cells: t.ICellMap = {};
      (items || []).forEach((item, i) => (cells = { ...cells, ...api.row(index + i, item) }));
      return cells;
    },
  };

  return api;
}
