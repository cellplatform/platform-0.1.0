import { JsonMap } from '@platform/types';

export * from './components/GraphqlEditor/types';

export { JsonMap };
export type JsonFetcher = (params: any) => Promise<JsonMap>;
