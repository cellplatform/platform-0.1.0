/**
 * IPC Events.
 */
export type StoreEvents = StoreChangeEvent;

export type StoreChangeEvent = {
  type: '.SYS/STORE/change';
  payload: {};
};
