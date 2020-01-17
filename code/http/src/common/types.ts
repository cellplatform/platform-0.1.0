import { HttpEvent } from '../types';
export { Json } from '@platform/types';

export * from '../types';

export type FireEvent = (e: HttpEvent) => void;
