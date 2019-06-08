import * as React from 'react';

export * from './theme/types';
import { IPropsTheme } from './theme/types';

export type PropsData = object | PropArray;
export type PropScalar = string | boolean | number | null | undefined;
export type PropArray = Array<PropScalar | object>;
export type PropValue = PropScalar | PropArray | object | Function; // tslint:disable-line

export type PropType =
  | 'object'
  | 'array'
  | 'string'
  | 'boolean'
  | 'number'
  | 'null'
  | 'undefined'
  | 'function';

export type PropValueFactory = (
  e: PropValueFactoryArgs,
) => PropValueFactoryResponse | undefined | void;

export type PropValueFactoryResponse = {
  el?: React.ReactNode;
  underline?: {
    color: string | number;
    style: 'solid' | 'dashed';
  };
};

export type PropValueFactoryArgs = {
  path: string;
  key: string | number;
  value: PropValue;
  type: PropType;
  theme: IPropsTheme;
  change(args: { to: string }): void;
  onFocus(isFocused: boolean): void;
};

/**
 * [Events]
 */
export type PropsEvent = IPropsChangedEvent | IPropsFocusEvent;

export type IPropsChangedEvent<D extends PropsData = any> = {
  type: 'PROPS/changed';
  payload: IPropsChange<D>;
};
export type IPropsChange<D extends PropsData = any> = {
  path: string;
  key: string | number;
  value: { from: PropValue; to: PropValue };
  data: { from: D; to: D };
};

export type IPropsFocusEvent = {
  type: 'PROPS/focus';
  payload: IPropsFocus;
};
export type IPropsFocus = {
  isFocused: boolean;
  path: string;
};
