import { HttpEvent } from '../types';
import { Json } from '@platform/types';

export { Json };
export * from '../types';

export type FireEvent = (e: HttpEvent) => void;
