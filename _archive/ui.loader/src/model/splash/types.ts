import * as t from '../../types';

/**
 * Splash screen.
 */
export type ISplash = {
  isVisible: boolean;
  isSpinning?: boolean;
  el?: JSX.Element;
};

/**
 * Factory for creating elements rendered within the splash screen.
 */
export type SplashFactory = (args: SplashFactoryArgs) => JSX.Element | undefined;
export type SplashFactoryArgs = {
  type: 'TOP:LEFT' | 'TOP:RIGHT' | 'BOTTOM:LEFT' | 'BOTTOM:RIGHT';
  theme: t.LoaderTheme;
};
