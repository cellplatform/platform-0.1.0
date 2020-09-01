import { t } from '../common';

export type DevFactory = (bus: t.EventBus, label?: string) => IDevBuilder;

type C = IDevBuilderComponent;

/**
 * A suite of components to test.
 */
export type IDevBuilder = t.IDisposable & {
  module: t.HarnessModule;
  props: t.IDevProps;
  label(value: string): IDevBuilder; // Treeview node label.
  component(name: string): C;
};

/**
 * The test configuration for a single component under test.
 */
export type IDevBuilderComponent = {
  props: t.IDevComponentProps;
  name(value: string): C;
  label(value: string): C; // Treeview node label.
  render(fn: DevRenderComponent): C;
  sidebar(fn: DevRenderSidebar): C;
  width(value: number | string | undefined): C;
  height(value: number | string | undefined): C;
  background(value: number | string | undefined): C;
  border(value: boolean | number): C;
  cropMarks(value: boolean | number): C;
};

/**
 * Renderer for a component under test.
 */
export type DevRenderContext = {};
export type DevRenderResponse = JSX.Element | null;
export type DevRenderComponent = (e: DevRenderContext) => DevRenderResponse | void;
export type DevRenderSidebar = (e: DevRenderContext) => DevRenderResponse | void;
