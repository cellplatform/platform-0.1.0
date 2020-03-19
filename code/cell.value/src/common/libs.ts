import { equals, uniq, flatten } from 'ramda';
export const R = { equals, uniq, flatten };

export { value, defaultValue } from '@platform/util.value';
export { diff } from '@platform/util.diff';
export { Schema, Uri } from '@platform/cell.schema';
export { isNilOrEmptyObject, isEmptyObject } from '@platform/cell.schema/lib/common';
