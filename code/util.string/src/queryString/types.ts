export type UrlQueryValue = string | boolean;
export type UrlQueryObject = { [key: string]: UrlQueryValue | UrlQueryValue[] };

/**
 * Represents a query-string.
 * NB: this record type is derived from NextJS's declaration
 * for the [ctx.query] type.
 */
export type UrlQuery = Record<string, string | string[] | number | boolean | undefined>;
