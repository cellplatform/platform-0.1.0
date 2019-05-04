import { Observable } from 'rxjs';

export type IProps<T extends {} = any> = { [P in keyof T]: T[P] };
export type IObservableProps<P extends {} = any> = IProps<P> & {
  readonly $: {
    readonly dispose$: Observable<{}>;
    readonly events$: Observable<PropEvent>;
  };
  readonly changing$: Observable<IPropChanging<P>>;
  readonly changed$: Observable<IPropChanged<P>>;
  readonly isDisposed: boolean;
  dispose(): void;
  toObject(): IProps<P>;
};

/**
 * [Events]
 */
export type PropEvent = IPropGettingEvent | IPropGetEvent | IPropChangingEvent | IPropChangedEvent;

export type IPropGettingEvent<P extends IProps = any> = {
  type: 'PROP/getting';
  payload: IPropGetting<P>;
};
export type IPropGetting<P extends IProps = any> = {
  key: keyof P;
  value: P[keyof P];
  isModified: boolean;
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

export type IPropChangingEvent<P extends IProps = any> = {
  type: 'PROP/setting';
  payload: IPropChanging<P>;
};
export type IPropChanging<P extends IProps = any> = {
  key: keyof P;
  value: { from: P[keyof P]; to: P[keyof P] };
  isCancelled: boolean;
  cancel(): void;
};

export type IPropChangedEvent<P extends IProps = any> = {
  type: 'PROP/set';
  payload: IPropChanged<P>;
};
export type IPropChanged<P extends IProps = any> = {
  key: keyof P;
  value: { from: P[keyof P]; to: P[keyof P] };
};
