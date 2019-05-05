import { CSSProperties } from 'glamor';
import { transformStyle } from './css/css';

export type IImageOptions = {
  width?: number;
  height?: number;
};

export type IBackgroundImageStyles = {
  backgroundImage: string;
  width?: number;
  height?: number;
  backgroundSize: string;
  backgroundRepeat: string;
};

export type FormatImage = (
  image1x: string | undefined,
  image2x: string | undefined,
  options?: IImageOptions,
) => IBackgroundImageStyles;

export type Falsy = undefined | null | false;
export class GlamorValue {}
export type IFormatCss = {
  (...styles: Array<React.CSSProperties | GlamorValue | Falsy>): GlamorValue;
  image: FormatImage;
};

export type GlobalCssRules = (
  styles: { [selector: string]: CssProps },
  options?: { prefix?: string },
) => void;

export type CssProps = CSSProperties;
export type ClassName = (...styles: Array<CssProps | undefined>) => string;

export type ICssHead = { importStylesheet: ImportStylesheet };
export type ImportStylesheet = (url: string) => IStyle;

export type IStyle = IFormatCss & {
  global: GlobalCssRules;
  className: ClassName;
  transform: typeof transformStyle;
  head: ICssHead;
  merge: (...rules: any[]) => CssProps;
  toEdges: ToCssEdges<IEdges>;
  toMargins: ToCssEdges<IMarginEdges>;
  toPadding: ToCssEdges<IPaddingEdges>;
};

export type EdgesInput = string | number | undefined | null | Array<string | number | null>;

export type ToCssEdges<T> = (
  input?: EdgesInput,
  options?: { defaultValue?: EdgesInput },
) => Partial<T>;

export type IEdges = {
  top: string | number;
  right: string | number;
  bottom: string | number;
  left: string | number;
};

export type IMarginEdges = {
  marginTop: string | number;
  marginRight: string | number;
  marginBottom: string | number;
  marginLeft: string | number;
};

export type IPaddingEdges = {
  paddingTop: string | number;
  paddingRight: string | number;
  paddingBottom: string | number;
  paddingLeft: string | number;
};
