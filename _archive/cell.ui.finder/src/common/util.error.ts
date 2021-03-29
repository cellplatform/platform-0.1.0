import * as t from './types';
import { ErrorView } from '@platform/cell.ui/lib/components/Error';

/**
 * Produces an error event payload.
 */
export function toErrorPayload(args: {
  name: t.IFinderError['name'];
  error: Error | string;
  errorInfo?: React.ErrorInfo;
}): t.IFinderError {
  const { name, errorInfo } = args;
  const component = errorInfo ? ErrorView.parseComponentStack(errorInfo.componentStack) : undefined;
  const error = ErrorView.parseError(args.error);
  const payload = { name, error, component };
  return payload;
}
