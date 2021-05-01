import { IDisposable } from '@platform/types';
import { PeerFile } from '../../types';

export type FileCache = IDisposable & {
  name: string;
  version: number;
  put(file: PeerFile): Promise<PeerFile>;

  get: {
    byHash(hash: string): Promise<PeerFile | undefined>;
  };
};
