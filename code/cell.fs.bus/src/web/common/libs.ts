import { clone, uniq, flatten } from 'ramda';
export const R = { clone, uniq, flatten };

export { rx, slug, cuid, asArray, time } from '@platform/util.value';
export { Hash, Uri, Schema, ManifestFiles } from '@platform/cell.schema';
export { Path } from '@platform/cell.fs/lib/Path';
export { PathUri } from '@platform/cell.fs/lib/PathUri';
export { HttpClient } from '@platform/cell.client';
