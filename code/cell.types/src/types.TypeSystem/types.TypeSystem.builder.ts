import { t } from '../common';

/**
 * A structured API for building a set of type-definitions in code.
 */
export type ITypeBuilder = {
  ns(uri?: string | t.INsUri): ITypeBuilderNs;
  type(typename: string, options?: ITypeBuilderNsTypeOptions): ITypeBuilderType;
  toObject(): ITypeBuilderDefs;
  formatType(value: string): string;
};

export type ITypeBuilderDefs = { [namespace: string]: t.ITypeDefPayload };

/**
 * Builder for a type(s) within a namespace.
 */
export type ITypeBuilderNs = {
  readonly uri: t.INsUri;
  readonly types: ITypeBuilderType[];
  type(typename: string, options?: ITypeBuilderNsTypeOptions): ITypeBuilderType;
  toString(): string;
};
export type ITypeBuilderNsTypeOptions = { startColumn?: string | number };

/**
 * Builder for a single named type within a namespace.
 */
export type ITypeBuilderType = {
  readonly uri: t.INsUri;
  readonly typename: string;
  readonly props: ITypeBuilderProp[];
  prop(
    name: string,
    arg?: t.CellType | ITypeBuilderPropOptions | ((builder: ITypeBuilderProp) => void),
  ): ITypeBuilderType;
  toString(): string;
};

export type ITypeBuilderPropOptions = {
  type?: t.CellType;
  target?: t.CellTypeTarget;
  default?: t.ITypeDefault | t.TypeDefaultValue;
  column?: string | number;
};

/**
 * Builder for a single column/property.
 */
export type ITypeBuilderProp = {
  column(value: string | number): ITypeBuilderProp;
  name(value: string): ITypeBuilderProp;
  type(value: t.CellType): ITypeBuilderProp;
  target(value: t.CellTypeTarget | undefined): ITypeBuilderProp;
  default(value: t.ITypeDefault | t.TypeDefaultValue | undefined): ITypeBuilderProp;
  toObject(): ITypeBuilderPropObject;
};

export type ITypeBuilderPropObject = {
  readonly column: string;
  readonly name: string;
  readonly type: t.CellType;
  readonly target?: t.CellTypeTarget;
  readonly default?: t.ITypeDefault | t.TypeDefaultValue;
};
