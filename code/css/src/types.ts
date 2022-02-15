import * as t from './common/types';
import { transform } from './css/css';

export class CssValue {}
export type Falsy = undefined | null | false;
export type CssProps = React.CSSProperties;
export type CssPropsMap = { [selector: string]: CssProps };
export type CssClassName = (...styles: Array<CssProps | undefined>) => string;
export type CssMergeRules = (...rules: any[]) => CssProps;

/**
 * API
 */
export type CssFormat = (...styles: Array<t.CssProps | CssValue | Falsy>) => CssValue;

export type ICssStyle = {
  transform: typeof transform;
  format: CssFormat;
  global: CssGlobal;
  head: ICssHead;
  image: CssFormatImage;
  toEdges: CssToEdges<CssEdges>;
  toMargins: CssToEdges<CssMarginEdges>;
  toPadding: CssToEdges<CssPaddingEdges>;
  toShadow: CssToShadow;
  toPosition: CssToPosition;
  toAbsolute: CssToAbsolute;
  toRadius: CssToRadius;
};

/**
 * Global
 */
export type CssGlobal = (styles: CssPropsMap, options?: { prefix?: string }) => void;
export type ICssHead = {
  importStylesheet(url: string): ICssHead;
};

/**
 * Edges
 */
type N = string | number | null | undefined;

export type CssEdgeInput = N;
export type CssEdgesInput = N | [N] | [N, N] | [N, N, N, N];
export type CssToEdges<T> = (
  input?: CssEdgesInput | [],
  options?: { defaultValue?: CssEdgesInput },
) => Partial<T>;
export type CssEdges = {
  top: string | number;
  right: string | number;
  bottom: string | number;
  left: string | number;
};
export type CssMarginEdges = {
  marginTop: string | number;
  marginRight: string | number;
  marginBottom: string | number;
  marginLeft: string | number;
};
export type CssPaddingEdges = {
  paddingTop: string | number;
  paddingRight: string | number;
  paddingBottom: string | number;
  paddingLeft: string | number;
};

/**
 * Image
 */
export type CssFormatImageOptions = { width?: number; height?: number };
export type CssFormatImage = (
  image1x: string | undefined,
  image2x: string | undefined,
  options?: CssFormatImageOptions,
) => ICssBackgroundImage;

export type ICssBackgroundImage = {
  backgroundImage: string;
  width?: number;
  height?: number;
  backgroundSize: string;
  backgroundRepeat: string;
};

/**
 * Shadow
 */
export type CssToShadow = (input?: CssShadow) => string | undefined;
export type CssShadow = {
  color: number | string;
  blur: number;
  x?: number;
  y?: number;
  inner?: boolean;
};

/**
 * Position
 */
export type CssPosition = 'absolute' | 'fixed' | 'relative' | 'static' | 'sticky';
export type CssEdgePosition = CssEdges & { position: CssPosition };

export type CssToPosition = (position: CssPosition, edges: CssEdgesInput) => CssEdgePosition;
export type CssToAbsolute = (edges: CssEdgesInput) => CssEdgePosition;

/**
 * Border/Corner Radius
 */
export type CssRadiusInput = N | [N, N, N, N];
export type CssToRadius = (corner: CssRadiusInput) => string | undefined;
