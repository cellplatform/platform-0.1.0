import { t } from '../common';

export type DevFactory = (bus: t.EventBus, label?: string) => IDev;

/**
 * A suite of components to test.
 */
export type IDev = t.IDisposable & {
  module: t.DevModule;
  props: t.DevProps;
  label(value: string): IDev;
  component(label: string): IDevComponent;
};

/**
 * The test configuration for a single component under test.
 */
export type IDevComponent = {
  props: t.DevProps;
  render(fn: DevComponentRender): IDevComponent;
  label(value: string): IDevComponent;
  width(value: number | string | undefined): IDevComponent;
  height(value: number | string | undefined): IDevComponent;
};

/**
 * Renderer for a component under test.
 */
export type DevComponentRender = (e: DevComponentRenderContext) => DevComponentRenderResponse;
export type DevComponentRenderContext = t.Object;
export type DevComponentRenderResponse = JSX.Element | null | void;
