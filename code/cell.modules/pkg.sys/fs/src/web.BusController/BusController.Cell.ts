import { asArray, Path, t, R, DEFAULT } from './common';
import { ManifestCache } from './ManifestCache';
import { Format } from './Format';

type FilesystemId = string;

/**
 * Event controller.
 */
export function BusControllerCell(args: {
  id: FilesystemId;
  fs: t.IFsLocal;
  bus: t.EventBus<t.SysFsEvent>;
  events: t.SysFsEvents;
}) {
  const { id, fs, bus, events } = args;
  //
}
