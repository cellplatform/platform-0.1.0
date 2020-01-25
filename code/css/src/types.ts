import * as t from './common/types';
import { transformStyle } from './css/css';

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

export type ICssStyle = CssFormat & {
  global: CssGlobal;
  className: CssClassName;
  transform: typeof transformStyle;
  head: ICssHead;
  merge: CssMergeRules;
  toEdges: CssToEdges<ICssEdges>;
  toMargins: CssToEdges<ICssMarginEdges>;
  toPadding: CssToEdges<ICssPaddingEdges>;
  image: CssFormatImage;
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
export type CssEdgesInput = string | number | undefined | null | Array<string | number | null>;
export type CssToEdges<T> = (
  input?: CssEdgesInput,
  options?: { defaultValue?: CssEdgesInput },
) => Partial<T>;
export type ICssEdges = {
  top: string | number;
  right: string | number;
  bottom: string | number;
  left: string | number;
};
export type ICssMarginEdges = {
  marginTop: string | number;
  marginRight: string | number;
  marginBottom: string | number;
  marginLeft: string | number;
};
export type ICssPaddingEdges = {
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
