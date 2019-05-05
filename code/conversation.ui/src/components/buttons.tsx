import * as React from 'react';
import { Button, IButtonProps } from '@platform/ui.button';

export { Button, IButtonProps };

const theme = Button.theme;

const HOVER_GRAY = theme.BORDER.BASE;
const HOVER_GRAY_OVER = theme.BORDER.BASE;
HOVER_GRAY_OVER.backgroundColor.enabled = 0.9;

export const Blue = (props: IButtonProps) => <Button theme={theme.BORDER.BLUE} {...props} />;

export const HoverGrey = (props: IButtonProps) => (
  <Button theme={HOVER_GRAY} overTheme={HOVER_GRAY_OVER} {...props} />
);
