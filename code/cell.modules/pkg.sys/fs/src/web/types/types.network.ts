import { SysFsChanged } from '@platform/cell.fs.bus/lib/types';

type FilesystemId = string;
type PeerId = string;

/**
 * Events
 */
export type SysFsNetworkEvent = SysFsNetworkChangedEvent;

/**
 * Broadcasts to the network that a file-system change has occured.
 */
export type SysFsNetworkChangedEvent = {
  type: 'sys.fs/network/changed';
  payload: SysFsNetworkChanged;
};
export type SysFsNetworkChanged = {
  id: FilesystemId;
  peer: PeerId;
  change: SysFsChanged;
};
