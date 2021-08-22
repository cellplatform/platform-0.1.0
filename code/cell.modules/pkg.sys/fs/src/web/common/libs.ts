import { clone, uniq, flatten } from 'ramda';
export const R = { clone, uniq, flatten };

export { rx, slug, asArray } from '@platform/util.value';
export { Hash, Uri, Schema } from '@platform/cell.schema';
export { Path } from '@platform/cell.fs/lib/Path';
export { PathUri } from '@platform/cell.fs/lib/PathUri';
export { HttpClient } from '@platform/cell.client';
