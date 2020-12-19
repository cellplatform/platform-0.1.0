import React from 'react';
import { t, css, CssValue, DEFAULT, COLORS } from '../../common';
import { Theme } from '../../Monaco.config/configure.theme';
import { Spinner } from '../primitives';

export type LoadingProps = {
  theme?: t.CodeEditorTheme;
  style?: CssValue;
};

export const Loading: React.FC<LoadingProps> = (props) => {
  const { theme = DEFAULT.THEME } = props;
  const colors = Theme.byName(props.theme || DEFAULT.THEME).data.colors;

  const styles = {
    base: css({
      Absolute: 0,
      backgroundColor: colors['editor.background'],
      Flex: 'center-center',
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <Spinner color={Theme.isDark(theme) ? COLORS.WHITE : COLORS.DARK} />
    </div>
  );
};
