type O = Record<string, unknown>;

export type Event<P extends O = any> = {
  type: string;
  payload: P;
};

export type FireEvent<E extends Event> = (event: E) => void;
