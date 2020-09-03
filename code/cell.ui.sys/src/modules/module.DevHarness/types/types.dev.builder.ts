import { t } from '../common';

export type DevFactory = (bus: t.EventBus, label?: string) => IDevBuilder;

type C = IDevBuilderComponent;
type A = IDevBuilderPositionAbsolute;

/**
 * A suite of components to test.
 */
export type IDevBuilder = t.IDisposable & {
  id: string;
  module: t.HarnessModule;
  props: t.IDevProps;
  label(value: string): IDevBuilder; // Treeview node label.
  component(name: string): C;
};

/**
 * The test configuration for a single component under test.
 */
export type IDevBuilderComponent = {
  id: string;
  props: t.IDevComponentProps;
  name(value: string): C;
  label(value: string): C; // Treeview node label.
  render(fn: DevRenderComponent): C;
  sidebar(fn: DevRenderSidebar): C;
  width(value: number | string | undefined): C;
  height(value: number | string | undefined): C;
  background(value: number | string | undefined): C;
  border(value: boolean | number): C;
  cropmarks(value: boolean | number): C;
  position(fn: (pos: IDevBuilderPosition) => void): C;
  component(name: string): C;
};

/**
 * Tools for defining the position of a component.
 */
export type IDevBuilderPosition = {
  absolute: A;
};

export type IDevBuilderPositionAbsolute = {
  top(value: number | undefined): A;
  right(value: number | undefined): A;
  bottom(value: number | undefined): A;
  left(value: number | undefined): A;
  x(value: number | undefined): A;
  y(value: number | undefined): A;
  xy(value: number | undefined): A;
};

/**
 * Renderer for a component under test.
 */
export type DevRenderContext = {};
export type DevRenderResponse = JSX.Element | null;
export type DevRenderComponent = (ctx: DevRenderContext) => DevRenderResponse | void;
export type DevRenderSidebar = (ctx: DevRenderContext) => DevRenderResponse | void;
