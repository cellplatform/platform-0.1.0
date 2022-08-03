import { clone, equals } from 'ramda';
export const R = { clone, equals };

/**
 * @platform
 */
export { Mime } from '@platform/util.mimetype';
export { slug, time, asArray, rx, deleteUndefined } from '@platform/util.value';
export { Http } from '@platform/http';
export { Path } from '@platform/cell.fs';
export { fs as nodefs } from '@platform/fs';
export { Manifest } from '@platform/cell.compiler/lib/node/Manifest';
export { ManifestFiles } from '@platform/cell.schema/lib/Manifest';
export { log } from '@platform/log/lib/server';

/**
 * System
 */
export { Filesystem } from 'sys.fs/lib/node';

/**
 * Local
 */
export { BusEvents } from '../../web/Bus';
