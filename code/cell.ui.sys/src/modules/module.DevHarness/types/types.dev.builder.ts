import { t } from '../common';

export type DevFactory = (bus: t.EventBus, label?: string) => IDevBuilder;

/**
 * A suite of components to test.
 */
export type IDevBuilder = t.IDisposable & {
  module: t.HarnessModule;
  props: t.IDevProps;
  label(value: string): IDevBuilder;
  component(name: string): IDevComponentBuilder;
};

/**
 * The test configuration for a single component under test.
 */
export type IDevComponentBuilder = {
  props: t.IDevComponentProps;
  name(value: string): IDevComponentBuilder;
  label(value: string): IDevComponentBuilder; // Treeview node label.
  render(fn: DevRenderComponent): IDevComponentBuilder;
  sidebar(fn: DevRenderSidebar): IDevComponentBuilder;
  width(value: number | string | undefined): IDevComponentBuilder;
  height(value: number | string | undefined): IDevComponentBuilder;
  border(value: boolean | number): IDevComponentBuilder;
  cropMarks(value: boolean | number): IDevComponentBuilder;
};

/**
 * Renderer for a component under test.
 */
export type DevRenderContext = {};
export type DevRenderResponse = JSX.Element | null;
export type DevRenderComponent = (e: DevRenderContext) => DevRenderResponse | void;
export type DevRenderSidebar = (e: DevRenderContext) => DevRenderResponse | void;
