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
 * Builder for a single complex (namespace) type.
 */
export type ITypeBuilderNs = {
  readonly uri: t.INsUri;
  toObject(): t.ITypeDefPayload;
};



export type IDefBuilderColumns = {
  readonly typename: string;
};
