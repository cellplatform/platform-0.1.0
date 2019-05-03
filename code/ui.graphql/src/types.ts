import { IJsonMap } from '@platform/util.value/lib/types';

export * from './components/GraphqlEditor/types';

export { IJsonMap };
export type JsonFetcher = (params: any) => Promise<IJsonMap>;
