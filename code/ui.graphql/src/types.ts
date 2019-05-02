export * from './components/GraphqlEditor/types';

import { Json, IJsonMap } from '@platform/util.value/lib/types';

export { IJsonMap };
export type JsonFetcher = (params: any) => Promise<IJsonMap>;
