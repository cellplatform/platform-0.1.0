/**
 * High-level client API that makes programming against
 * a lower-level platform [FsDriver] isolated, consistent and easy.
 */
export type Fs = {
  read(path: string): Promise<Uint8Array | undefined>;
  write(path: string, data: Uint8Array | ArrayBuffer): Promise<FsWriteResponse>;
  exists(path: string): Promise<boolean>;
};

export type FsWriteResponse = { hash: string; bytes: number };
