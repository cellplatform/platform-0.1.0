export * from './components/GraphqlEditor/types';

export type JsonValue = boolean | number | string | null | IJson | JsonValue[];
export type Json = {
  [key: string]: JsonValue;
};

export type JsonFetcher = (params: any) => Promise<Json | undefined>;
