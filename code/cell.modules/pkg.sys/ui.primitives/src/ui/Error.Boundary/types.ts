import { CssValue } from '../../common/types';

/**
 * Renderer for an error visible within the boudary.
 */
export type RenderBoundaryError = (props: ErrorViewProps) => JSX.Element;

/**
 * The view displayed when the tree below the boundary is in an error state.
 */
export type ErrorViewProps = {
  error?: Error;
  info?: React.ErrorInfo;
  style?: CssValue;
  onClear?: () => void;
};
