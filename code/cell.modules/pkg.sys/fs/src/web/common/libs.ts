import { clone, uniq, flatten } from 'ramda';
export const R = { clone, uniq, flatten };

import Filesize from 'filesize';
export { Filesize };

/**
 * @platform
 */
export { HttpClient } from '@platform/cell.client';
export { Hash, Uri, Schema, ManifestHash, ManifestFiles, Mime } from '@platform/cell.schema';
export { WebRuntime } from '@platform/cell.runtime.web';
export { rx, slug, cuid, time, deleteUndefined, value } from '@platform/util.value';
export { Filesystem, Stream } from '@platform/cell.fs.bus/lib/web';
export { Path, PathUri } from '@platform/cell.fs';
