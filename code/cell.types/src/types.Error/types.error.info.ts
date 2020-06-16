import { t } from '../common';

/**
 * Error Info (parsed).
 */

export type IErrorInfo = {
  message: string;
  name: string;
  stack: t.IErrorStack[];
};

export type IErrorStack = {
  text: string;
  location: string;
  line: number;
  char: number;
  anon: boolean;
  toString(): string;
};

export type IErrorComponent = {
  name: string;
  stack: t.IErrorComponentStack[];
  toString(): string;
};

export type IErrorComponentStack = {
  createdBy: string;
  lineIn: string;
  toString(): string;
};
