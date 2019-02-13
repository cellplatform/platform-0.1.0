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

export type ICssHead = {
  importStylesheet: ImportStylesheet;
};
export type ImportStylesheet = (url: string) => IStyle;

export type IStyle = IFormatCss & {
  global: GlobalCssRules;
  className: ClassName;
  transform: typeof transformStyle;
  head: ICssHead;
  merge: (...rules: any[]) => CssProps;
  arrayToEdges: (
    input: string | number | undefined | null | Array<string | number | null>,
  ) =>
    | {
        top: string | number | undefined;
        right: string | number | undefined;
        bottom: string | number | undefined;
        left: string | number | undefined;
      }
    | undefined;
};
