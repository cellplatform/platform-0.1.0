import { Http, HttpHeaders } from '@platform/http.types';

export * from '../../types';
export { Event, EventBus, Json, JsonMap } from '@platform/types';
export { Http };

export type Ctx = {
  http: Http;
  headers: HttpHeaders;
};
