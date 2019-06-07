export * from './theme/types';

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

/**
 * [Events]
 */
export type PropsEvent = IPropsChangedEvent;

export type IPropsChangedEvent<D extends PropsData = any> = {
  type: 'PROPS/changed';
  payload: IPropsChange<D>;
};
export type IPropsChange<D extends PropsData = any> = {
  path: string;
  key: string;
  value: { from: PropValue; to: PropValue };
  data: { from: D; to: D };
};
