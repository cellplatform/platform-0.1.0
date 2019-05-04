import * as t from '../types';
import { valueUtil } from '../common';

const isBlank = (value: t.EdgesInput) => {
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value === 'string' && valueUtil.isBlank(value)) {
    return true;
  }
  if (Array.isArray(value) && valueUtil.compact(value).length === 0) {
    return true;
  }
  return false;
};

/**
 * Takes an array of input CSS values and converts them to
 * [top, right, bottom, left] values.
 *
 * Input:
 *  - single value (eg. 0 or '5em')
 *  - 4-part array (eg. [10, null, 0, 5])
 *  - Y/X array    (eg. [20, 5])
 *
 */
export const toEdges: t.ToCssEdges<t.IEdges> = (input, options = {}) => {
  const { defaultValue } = options;
  if (isBlank(input)) {
    if (defaultValue && !isBlank(defaultValue)) {
      input = defaultValue;
    }
  }

  if (!input) {
    return {};
  }

  if (!Array.isArray(input)) {
    input = input.toString().split(' ');
  }

  const edges = input
    .map(item => (typeof item === 'string' && item.endsWith('px') ? item.replace(/px$/, '') : item))
    .map(item => valueUtil.toNumber(item));
  let top: number | undefined;
  let right: number | undefined;
  let bottom: number | undefined;
  let left: number | undefined;

  const getEdge = (index: number): number | undefined => {
    const edge = edges[index];
    if (edge === null || edge === 'null' || edge === '') {
      return undefined;
    }
    return edge;
  };

  switch (edges.length) {
    case 1:
      top = getEdge(0);
      bottom = getEdge(0);
      left = getEdge(0);
      right = getEdge(0);
      break;

    case 2:
      top = getEdge(0);
      bottom = getEdge(0);
      left = getEdge(1);
      right = getEdge(1);
      break;

    case 3:
      top = getEdge(0);
      left = getEdge(1);
      right = getEdge(1);
      bottom = getEdge(2);
      break;

    default:
      top = getEdge(0);
      right = getEdge(1);
      bottom = getEdge(2);
      left = getEdge(3);
  }

  if (top === undefined && right === undefined && bottom === undefined && left === undefined) {
    return {};
  }
  return {
    top,
    right,
    bottom,
    left,
  };
};

/**
 * Prefixes each of the edge properties with the given prefix.
 */
export function prefixEdges<T extends {}>(prefix: string, edges: Partial<t.IEdges>): T {
  return Object.keys(edges).reduce((acc, key) => {
    const value = edges[key];
    key = `${prefix}${key[0].toUpperCase()}${key.substr(1)}`;
    return { ...acc, [key]: value };
  }, {}) as T;
}

/**
 * Converts input to CSS margin edges.
 */
export const toMargins: t.ToCssEdges<t.IMarginEdges> = (input, options = {}) => {
  return prefixEdges<t.IMarginEdges>('margin', toEdges(input, options));
};

/**
 * Converts input to CSS padding edges.
 */
export const toPadding: t.ToCssEdges<t.IPaddingEdges> = (input, options = {}) => {
  return prefixEdges<t.IPaddingEdges>('padding', toEdges(input, options));
};
