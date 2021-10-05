import { Http, HttpHeaders, HttpResponse } from '@platform/http.types';
import { Fs } from '@platform/cell.types';

export * from '../../types';

export { Http, HttpHeaders, HttpResponse };
export { Disposable, EventBus, Event, JsonMap } from '@platform/types';
export { Observable } from 'rxjs';
export { Fs } from '@platform/cell.types';

export type HttpCtx = {
  http: Http;
  headers: HttpHeaders;
  fs: Fs;
};

type S = Pick<ReadableStreamDefaultReader<any>, 'read'>;
export type ConvertUploadFile = (input: Uint8Array) => File | Blob | S;
