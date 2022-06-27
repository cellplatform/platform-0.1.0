import * as t from '../../common/types';

type Pixels = number;

export type LoadMaskTheme = 'Light' | 'Dark';

export type LoadMaskProps = {
  theme?: LoadMaskTheme;
  spinner?: boolean;
  tile?: boolean;
  blur?: Pixels;
  style?: t.CssValue;
};
