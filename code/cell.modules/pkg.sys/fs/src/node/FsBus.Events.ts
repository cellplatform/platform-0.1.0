import { fs as nodefs } from '@platform/fs';
import { BusEvents as Events } from '../web.BusEvents';
import { t } from './common';

type FilesystemId = string;
type Milliseconds = number;

/**
 * Event API (node-js) implementation.
 */
export function BusEvents(args: {
  id: FilesystemId;
  bus: t.EventBus<any>;
  filter?: (e: t.SysFsEvent) => boolean;
  timeout?: Milliseconds; // Default timeout.
}): t.SysFsEvents {
  /**
   * NOTE: Inject the [node-js] platform specific
   *       mechanism for reading streams.
   *
   *       This differs from the newer web-standards for working
   *       with streams, eg [ReadableStream] implementations, and
   *       rather uses the early node implementation of reading/writing
   *        to streams.
   *
   */
  const toUint8Array = nodefs.stream.toUint8Array;
  return Events({ ...args, toUint8Array });
}
