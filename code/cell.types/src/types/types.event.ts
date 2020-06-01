export type Event<P extends object = {}> = {
  type: string;
  payload: P;
};
