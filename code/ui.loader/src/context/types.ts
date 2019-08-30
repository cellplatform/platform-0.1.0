import * as t from '../types';

/**
 * The context object that is passed down through the React hierarchy.
 */
export type ILoaderContext = {
  loader: t.ILoader;
  splash: t.ISplash;
  theme: t.LoaderTheme;
};

/**
 * Callback function that manipulates assigns context properties.
 * (extensibility book)
 */
export type LoaderContextUpdateProps<P extends object> = (args: {
  loader: t.ILoader;
}) => Partial<P> | void;
