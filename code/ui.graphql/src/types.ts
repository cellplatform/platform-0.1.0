export * from './components/GraphqlEditor/types';

export type JsonValue =
  | boolean
  | number
  | string
  | null
  | Json
  | Array<boolean | number | string | null | Json>;

export type Json = {
  [key: string]: JsonValue;
};

export type JsonFetcher = (params: any) => Promise<Json>;
