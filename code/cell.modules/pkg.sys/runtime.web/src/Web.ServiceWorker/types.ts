/**
 * Service Worker Events.
 * - https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil
 */
export type ExtendableEvent = { waitUntil(promise: Promise<any>): Promise<any> };
export type InstallEvent = Event & ExtendableEvent;
export type ActivateEvent = Event & ExtendableEvent;
export type FetchEvent = Event & {
  request: Request;
  respondWith(response: Promise<Response> | Response): Promise<Response>;
};
