import { t } from '../common';

type F = DevBuilderFolder;
type C = DevBuilderComponent;
type A = DevBuilderPositionAbsolute;

export type DevFactory = (bus: t.EventBus, label?: string) => DevBuilder;

/**
 * A suite of components to test.
 */
export type DevBuilder = t.IDisposable & {
  id: string;
  module: t.HarnessModule;
  props: t.DevBuilderProps;
  label(value: string): DevBuilder; // Treeview node label.
  component(name: string): C;
  folder(name: string): F;
};
export type DevBuilderProps = {
  id: string;
  treeview: t.ITreeviewNodeProps;
};

/**
 * A containing folder.
 */
export type DevBuilderFolder = {
  id: string;
  props: DevBuilderFolderProps;
  folder(name: string): F;
  component(name: string): C;
  name(value: string): F;
};
export type DevBuilderFolderProps = {
  id: string;
  treeview: t.ITreeviewNodeProps;
  folder: t.IDevFolder;
};

/**
 * The test configuration for a single component under test.
 */
export type DevBuilderComponent = {
  id: string;
  props: t.DevBuilderComponentProps;
  name(value: string): C;
  label(value: string): C; // Treeview node label.
  render(fn: DevRenderComponent): C;
  sidebar(fn: DevRenderSidebar): C;
  width(value: number | string | undefined): C;
  height(value: number | string | undefined): C;
  background(value: number | string | undefined | DevBuilderColorEditor): C;
  border(value: boolean | number | DevBuilderColorEditor): C;
  cropmarks(value: boolean | number): C;
  position(fn: DevBuilderPositionEditor): C;
  component(name: string): C;
};
export type DevBuilderComponentProps = {
  id: string;
  treeview: t.ITreeviewNodeProps;
  component: t.IComponent;
  layout: t.IDevHostLayout;
};

/**
 * Tools for defining a color.
 */
export type DevBuilderColorEditor = (color: DevBuilderColor) => void;
export type DevBuilderColor = {
  INK(opacity?: number): DevBuilderColor;
  WHITE(opacity?: number): DevBuilderColor;
  BLACK(opacity?: number): DevBuilderColor;
  RED(opacity?: number): DevBuilderColor;
  MAGENTA(opacity?: number): DevBuilderColor;
  CYAN(opacity?: number): DevBuilderColor;
  GREEN(opacity?: number): DevBuilderColor;
  YELLOW(opacity?: number): DevBuilderColor;
  opacity(value: number): DevBuilderColor;
  color(value: string | number): DevBuilderColor;
};

/**
 * Tools for defining the position of a component.
 */
export type DevBuilderPositionEditor = (pos: DevBuilderPosition) => void;
export type DevBuilderPosition = {
  absolute: A;
};

export type DevBuilderPositionAbsolute = {
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
