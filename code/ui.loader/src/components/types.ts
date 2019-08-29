export type LoaderTheme = 'LIGHT' | 'DARK';

/**
 * Splash screen.
 */
export type SplashFactory = (args: SplashFactoryArgs) => JSX.Element | undefined;
export type SplashFactoryArgs = {
  type: 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT';
  theme: LoaderTheme;
};
