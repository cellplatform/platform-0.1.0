export interface IJsonMap {
  [member: string]: string | number | boolean | null | IJsonArray | IJsonMap;
}
export interface IJsonArray
  extends Array<string | number | boolean | null | IJsonArray | IJsonMap> {}

export type Json = IJsonMap | IJsonArray | string | number | boolean | null;
