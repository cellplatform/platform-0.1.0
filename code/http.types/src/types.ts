export * from './types.client';
export * from './types.events';
export * from './types.req';
export * from './types.res';

export type HttpMethod = 'HEAD' | 'GET' | 'PUT' | 'POST' | 'DELETE' | 'PATCH' | 'OPTIONS';
export type IHttpHeaders = { [key: string]: string };
