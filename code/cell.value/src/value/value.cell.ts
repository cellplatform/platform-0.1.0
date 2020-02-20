import { defaultValue, diff, R, t } from '../common';
import { isNilOrEmptyObject } from './util';
import { squash } from './value.squash';

export type CellChangeField = 'VALUE' | 'PROPS';

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
  if (typeof props !== 'object') {
    return true;
  }

  const keys = Object.keys(props);
  if (keys.length === 0) {
    return true;
  }

  for (const key of keys) {
    const child = props[key];
    if (key === 'value') {
      if (child !== undefined) {
        return false;
      }
    } else {
      if (typeof child === 'object') {
        if (Object.keys(child).length > 0) {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  return true;
}

/**
 * Collapses empty values on data objects.
 */
// export const squash = {
//   props(props?: t.ICellProps | t.IRowProps | t.IColumnProps) {
//     return squash.object(props);
//   },

//   cell(cell?: t.ICellData, options: { empty?: undefined | {} } = {}) {
//     const empty = defaultValue(options.empty, undefined);
//     if (!cell) {
//       return empty;
//     } else {
//       const res = { ...cell };
//       Object.keys(res)
//         .filter(key => isNilOrEmptyObject(res[key]))
//         .forEach(key => delete res[key]);
//       return squash.object(res, options);
//     }
//   },

//   object(obj?: object, options: { empty?: undefined | {} } = {}) {
//     const empty = defaultValue(options.empty, undefined);
//     if (!obj) {
//       return empty;
//     } else {
//       const res = { ...obj };
//       Object.keys(res)
//         .filter(key => isNilOrEmptyObject(res[key]))
//         .forEach(key => delete res[key]);
//       return isNilOrEmptyObject(res, { ignoreHash: true }) ? empty : res;
//     }
//   },
// };

/**
 * Compare two cells.
 */
export function cellDiff(left: t.ICellData, right: t.ICellData): t.ICellDiff {
  const list = diff.compare(left, right) as Array<diff.Diff<t.ICellData>>;
  const isDifferent = list.length > 0;
  return { left, right, isDifferent, list };
}

/**
 * Assigns a property field to {props}, removing it from the object
 * if it's the default value.
 */
export function setCellProp<P extends t.ICellProps, K extends keyof P>(args: {
  props?: Partial<P>;
  defaults: P[K];
  section: K;
  field: keyof P[K];
  value?: P[K][keyof P[K]];
}): P | undefined {
  const props = args.props || {};
  const defaults = args.defaults;
  const field = args.field as string;
  const section: P[K] = { ...(props[args.section as string] || {}), [field]: args.value };

  // Strip default values from the property section.
  if (defaults && typeof defaults === 'object') {
    Object.keys((defaults as unknown) as object)
      .filter(key => R.equals(section[key], defaults[key]))
      .forEach(key => delete section[key]);
  }

  // Strip undefined values from property section.
  if (typeof section === 'object') {
    Object.keys((section as unknown) as object)
      .filter(key => section[key] === undefined)
      .forEach(key => delete section[key]);
  }

  // Remove the section from the root props if empty.
  const res = { ...props, [args.section]: section };
  const isEmptySection = Object.keys((section as unknown) as object).length === 0;
  if (isEmptySection) {
    delete res[args.section as string];
  }

  // Finish up.
  return isEmptyCellProps(res) ? undefined : (res as P);
}

/**
 * Toggles the given boolean property field, removing it from the object
 * if it is the default value.
 */
export function toggleCellProp<P extends t.ICellProps, K extends keyof P>(args: {
  props?: Partial<P>;
  defaults: P[K];
  section: K;
  field: keyof P[K];
}): P | undefined {
  const props = args.props || {};
  const field = args.field as string;
  const section = (props[args.section as string] || {}) as {};
  const value = section[field];
  if (!(value === undefined || typeof value === 'boolean')) {
    return props as P; // NB: non-supported value type for toggling.
  }
  const toggled: any = typeof value === 'boolean' ? !value : true;
  return setCellProp<P, K>({ ...args, value: toggled });
}

/**
 * Helpers for reading/writing to cell data.
 */
export function cellData<P extends t.ICellProps = t.ICellProps>(cell?: t.ICellData<Partial<P>>) {
  const setLink = (
    links: t.IUriMap | undefined,
    key: string,
    uri?: string,
  ): t.IUriMap | undefined => {
    uri = (uri || '').trim();
    uri = !uri ? undefined : uri;
    return squash.object({ ...links, [key]: uri });
  };

  const api = {
    /**
     * Retrieves the property value from the given cell.
     */
    getValue() {
      return cell && cell.props ? cell.props.value : undefined;
    },

    /**
     * Assigns a new value to the cell (immutable).
     */
    setValue(value: t.CellValue): t.ICellData<P> {
      return squash.cell({ ...(cell || {}), value });
    },

    /**
     * Assign a property to the cell.
     */
    setProp<K extends keyof P>(args: {
      defaults: P[K];
      section: K;
      field: keyof P[K];
      value?: P[K][keyof P[K]];
    }): t.ICellData<P> | undefined {
      const props = setCellProp({ ...args, props: cell ? cell.props : undefined });
      return squash.cell(cell ? { ...cell, props } : { props });
    },

    /**
     * Assign a link URI to the cell.
     */
    setLink(key: string, uri?: string): t.ICellData<P> | undefined {
      const links = setLink((cell || {}).links, key, uri);
      return squash.cell(cell ? { ...cell, links } : { links });
    },

    /**
     * Appends or removes a set of link values to the existing set of links.
     */
    mergeLinks(links?: { [key: string]: string | undefined }): t.ICellData<P> | undefined {
      let uris: t.IUriMap = { ...(cell || {}).links };
      if (links) {
        Object.keys(links).forEach(key => {
          const uri = links[key];
          if (uri) {
            const res = setLink(uris, key, uri);
            if (res) {
              uris = { ...uris, ...res };
            }
          }
        });
        Object.keys(links).forEach(key => {
          if (links[key] === undefined) {
            delete uris[key];
          }
        });
      }
      uris = squash.object(uris);
      return squash.cell(cell ? { ...cell, links: uris } : { links: uris });
    },
  };
  return api;
}
