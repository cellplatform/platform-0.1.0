import { Observable } from 'rxjs';

export type IProps<T = any> = { [key: string]: T };
export type IObservableProps<P extends IProps<P>> = Record<keyof P, P[keyof P]> & {
  readonly $: {
    readonly dispose$: Observable<{}>;
    readonly events$: Observable<PropEvent>;
    readonly getting$: Observable<IPropGetting<P>>;
    readonly get$: Observable<IPropGet<P>>;
    readonly setting$: Observable<IPropSetting<P>>;
    readonly set$: Observable<IPropSet<P>>;
  };
  readonly isDisposed: boolean;
  dispose(): void;
};

/**
 * [Events]
 */
export type PropEvent = IPropGettingEvent | IPropGetEvent | IPropSettingEvent | IPropSetEvent;

export type IPropGettingEvent<P extends IProps = any> = {
  type: 'PROP/getting';
  payload: IPropGetting<P>;
};
export type IPropGetting<P extends IProps = any> = {
  key: keyof P;
  value: P[keyof P];
  modify(value: P[keyof P]): void;
};

export type IPropGetEvent<P extends IProps = any> = {
  type: 'PROP/get';
  payload: IPropGet<P>;
};
export type IPropGet<P extends IProps = any> = {
  key: keyof P;
  value: P[keyof P];
};

export type IPropSettingEvent<P extends IProps = any> = {
  type: 'PROP/setting';
  payload: IPropSetting<P>;
};
export type IPropSetting<P extends IProps = any> = {
  key: keyof P;
  value: { from: P[keyof P]; to: P[keyof P] };
  isCancelled: boolean;
  cancel(): void;
};

export type IPropSetEvent<P extends IProps = any> = {
  type: 'PROP/set';
  payload: IPropSet<P>;
};
export type IPropSet<P extends IProps = any> = {
  key: keyof P;
  value: { from: P[keyof P]; to: P[keyof P] };
};
