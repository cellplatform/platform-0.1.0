/**
 * IPC Events.
 */
export type StoreEvents = StoreChangeEvent;

export type StoreChangeEvent = {
  type: 'STORE/change';
  payload: {};
};
