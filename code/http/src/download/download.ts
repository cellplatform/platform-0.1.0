import 'isomorphic-fetch';
import { fs } from '@platform/fs';

import * as stream from 'stream';
import * as util from 'util';

const streamPipeline = util.promisify(stream.pipeline);

export type IDownloadResponse = {
  status: number;
  error?: string;
  ok: boolean;
};
export type IFetchDownloadResponse = IDownloadResponse & { stream?: ReadableStream<Uint8Array> };
export type IFetchDownloadSaveResponse = IDownloadResponse & { path: string };

/**
 * Setup a URL downloader.
 */
export function download(url: string) {
  const download = {
    url,

    /**
     * Downloads and saves to the given location.
     */
    async fetch() {
      const { status, statusText, ok, body } = await fetch(url);
      const error = ok ? undefined : statusText;
      const stream = body ? (body as any) : undefined;
      const res: IFetchDownloadResponse = { ok, status, error, stream };
      return res;
    },

    /**
     * Downloads and saves to the given location.
     */
    async save(path: string) {
      const { status, error, ok, stream } = await download.fetch();
      const res: IFetchDownloadSaveResponse = { ok, status, error, path };

      if (ok && stream) {
        try {
          await fs.ensureDir(fs.dirname(path));
          const output = fs.createWriteStream(path);
          await streamPipeline(stream as any, output);
        } catch (error) {
          res.ok = false;
          res.error = `Failed while saving. ${error.message}`;
          res.status = 500;
        }
      }

      return res;
    },
  };

  return download;
}
