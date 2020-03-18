export * from './types.client';
export * from './types.events';
export * from './types.fetch';
export * from './types.payload';

export type HttpMethod = 'HEAD' | 'GET' | 'PUT' | 'POST' | 'DELETE' | 'PATCH' | 'OPTIONS';
export type IHttpHeaders = { [key: string]: string };
