/**
 * Peer file data.
 */
export type PeerFile = {
  dir: string;
  filename: string;
  data: ArrayBuffer;
  mimetype: string;
  hash: string;
};
