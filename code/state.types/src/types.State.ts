type O = Record<string, unknown>;

export type StateChangeOperation = 'update' | 'replace';

export type StateChanger<T extends O> = (draft: T) => void;
export type StateChangerAsync<T extends O> = (draft: T) => Promise<void>;
