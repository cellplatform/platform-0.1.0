import { Stream } from 'stream';

export type ISwarm = {
  id: string;
  stream: (peer: any) => Stream;
  utp: boolean;
  tcp: boolean;
  maxConnections: number;
  whitelist: string[];
};
