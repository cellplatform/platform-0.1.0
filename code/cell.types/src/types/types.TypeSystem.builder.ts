import { t } from '../common';

/**
 * A structured API for building a set of type-definitions in code.
 */
export type ITypeBuilder = {
  defs: ITypeBuilderDefs;
  toObject(): ITypeBuilderDefs;
  ns(uri: string | t.INsUri): ITypeBuilderNs;
};

export type ITypeBuilderDefs = { [namespace: string]: t.ITypeDefPayload };

/**
 * Builder for a type(s) within a namespace.
 */
export type ITypeBuilderNs = {
  readonly uri: t.INsUri;
  toObject(): t.ITypeDefPayload;
  type(typename: string, options?: { startColumn?: string | number }): ITypeBuilderType;
};

/**
 * Builder for a single named type within a namespace.
 */
export type ITypeBuilderType = {
  readonly uri: t.INsUri;
  readonly typename: string;
  readonly startColumn: number;
};
