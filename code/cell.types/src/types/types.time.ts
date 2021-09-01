type Milliseconds = number;

export type Timeout = Milliseconds | NeverTimeout;
export type NeverTimeout = -1 | 'never';
