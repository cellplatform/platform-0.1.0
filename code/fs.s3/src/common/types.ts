export { Json } from '@platform/types/lib/json';
export * from '@platform/types';
export * from '@platform/http/lib/types';
export * from '../types';

export type GetAwsS3 = (endpoint: 'origin' | 'edge') => AWS.S3;
