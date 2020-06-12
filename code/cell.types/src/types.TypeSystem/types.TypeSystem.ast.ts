import { t } from '../common';

/**
 * Tokenizer
 */
export type ITypeToken = {
  input: string;
  kind: 'VALUE' | 'GROUP' | 'GROUP[]';
  text: string;
  next: string;
};

/**
 * Walk
 */
export type TypeVisit = (args: TypeVisitArgs) => void;
export type TypeVisitArgs = {
  level: number;
  path: string;
  root: t.IType;
  type: t.IType;
  prop?: string;
  optional?: boolean;
};
