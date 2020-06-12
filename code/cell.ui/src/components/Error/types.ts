export type IErrorInfo = {
  message: string;
  name: string;
  stack: IErrorStack[];
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
  stack: IErrorComponentStack[];
  toString(): string;
};

export type IErrorComponentStack = {
  createdBy: string;
  lineIn: string;
  toString(): string;
};
