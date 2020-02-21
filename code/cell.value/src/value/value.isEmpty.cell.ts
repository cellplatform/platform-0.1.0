import { t } from '../common';
import { isEmptyProps } from './value.isEmpty';
import { squash } from './value.squash';

/**
 * Determine if the given cell is empty (no value, no props).
 */
export function isEmptyCell(cell?: t.ICellData) {
  return cell
    ? isEmptyCellValue(cell.value) && isEmptyCellProps(cell.props) && isEmptyCellLinks(cell.links)
    : true;
}

/**
 * Determine if the given cell value is empty.
 */
export function isEmptyCellValue(value?: t.CellValue) {
  return value === '' || value === undefined;
}

/**
 * Determine if the given cell's links are empty.
 */
export function isEmptyCellLinks(links?: t.ICellData['links']) {
  return typeof links !== 'object' ? true : !squash.object(links);
}

/**
 * Determine if the given cell's props are empty.
 */
export function isEmptyCellProps(props?: t.ICellProps) {
  return isEmptyProps(props);
}
