import { Url } from '@platform/util.string/lib/Url/types';

export type FetchEvent = Event & {
  clientId: string;
  request: Request;
  respondWith(response: Promise<Response> | Response): Promise<Response>;
};

export type CacheUrl = Url & {
  isFilesystem: boolean;
  uri: string;
};
