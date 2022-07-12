import { Color, COLORS, t } from './common';

export const className = 'sys-doc-md-image';
export const markdownStyles: t.CssPropsMap = {
  p: {
    fontSize: 11,
    color: Color.alpha(COLORS.DARK, 0.4),
    lineHeight: '1.8em',
    marginTop: '1.2em',
    ':first-child': { marginTop: 0 },
    ':last-child': { marginBottom: 0 },
  },
  a: {
    color: Color.alpha(COLORS.DARK, 0.4),
  },
};
