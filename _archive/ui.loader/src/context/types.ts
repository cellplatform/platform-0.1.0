import * as t from '../types';

/**
 * The context object that is passed down through the React hierarchy.
 */
export type ILoaderContext = {
  loader: t.ILoader;
  splash: t.ISplash;
  theme: t.LoaderTheme;
};
