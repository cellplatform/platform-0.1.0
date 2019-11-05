import * as t from './types';

/**
 * Convert a grid selection into debug data.
 */
export function formatSelection(args: {
  grid: t.IGrid;
  selection: t.IGridSelection;
  maxValueLength?: number;
}) {
  const { grid, selection, maxValueLength = 30 } = args;

  const ranges = selection.ranges;
  const key = selection.cell || '';
  const cell = grid.data.cells[key];
  const value = getValueSync({ grid, key }) || '';
  const isEmpty = !Boolean(value);

  // Display string.
  const MAX = maxValueLength;
  let display = value.length > MAX ? `${value.substring(0, MAX)}...` : value;
  display = isEmpty ? '<empty>' : display;

  // Finish up.
  return { key, value, cell, display, isEmpty, ranges };
}

/**
 * Retrieve a value from the grid.
 */
export function getValueSync(args: { grid: t.IGrid; key: string }) {
  const { grid, key } = args;
  const cell = grid.data.cells[key];
  return cell && typeof cell.value === 'string' ? cell.value : undefined;
}

/**
 * Format a hash for display.
 */

export function formatHash(hash?: string, options: { trimPrefix?: string | boolean } = {}) {
  const trimPrefix = typeof options.trimPrefix === 'boolean' ? 'sha256-' : options.trimPrefix;
  hash = hash && trimPrefix ? hash.replace(new RegExp(`^${trimPrefix}`), '') : hash;
  const length = trimPrefix ? 5 : 12;
  return hash ? `${hash.substring(0, length)}..${hash.substring(hash.length - 5)}` : hash;
}
