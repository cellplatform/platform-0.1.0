import { CssValue } from '../../common/types';

export type ErrorViewProps = {
  error?: Error;
  info?: React.ErrorInfo;
  style?: CssValue;
  onClear?: () => void;
};
