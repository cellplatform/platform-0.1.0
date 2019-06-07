export * from './theme/types';

export type PropsData = object | any[];

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
  value: string;
  data: { from: D; to: D };
};
