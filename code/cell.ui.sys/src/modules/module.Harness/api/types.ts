import { t } from '../common';

type S = string;

export type Dev = {
  create<V extends S = S>(bus: t.EventBus): IDev<V>;
};

export type IDev<V extends S = S> = {
  module: t.DevModule;
  label(text: string): IDev<V>;
  component(label: string): IDevComponent<V>;
};

export type IDevComponent<V extends S = S> = {
  label(text: string): IDevComponent<V>;
  view(name: V | undefined): IDevComponent<V>;
};
