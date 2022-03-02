import { useEffect } from 'react';

type Namespace = string;

/**
 * Keeps a query string updated with the currently selected module "namespace".
 */
export function useDevQueryString(args: { isEnabled?: boolean; selected?: Namespace }) {
  const { isEnabled = true, selected = '' } = args;

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const url = new URL(location.href);

    if (isEnabled) {
      url.searchParams.set('dev', selected);
      window.history.pushState({}, '', url);
    }
  }, [selected, isEnabled]); // eslint-disable-line

  /**
   * API
   */
  return {
    isEnabled,
    selected,
  };
}
