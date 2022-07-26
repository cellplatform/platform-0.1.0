import { clone, uniq, flatten } from 'ramda';
export const R = { clone, uniq, flatten };

/**
 * @platform
 */
export { Hash, Uri, Schema, ManifestHash, ManifestFiles, Mime } from '@platform/cell.schema';
export { rx, slug, cuid, time, deleteUndefined, value } from '@platform/util.value';
export { Filesystem, Stream } from '@platform/cell.fs.bus/lib/web';
export { Path, PathUri } from '@platform/cell.fs';
