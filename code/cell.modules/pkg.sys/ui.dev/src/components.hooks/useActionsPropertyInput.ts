import { useEffect, useState } from 'react';
import { Format, t } from '../common';

/**
 * Wrangles a flexible input type into a list of [Actions] objects.
 */
export function useActionsPropertyInput(input?: t.ActionsSet) {
  const [actions, setActions] = useState<t.Actions[]>([]);

  useEffect(() => {
    Format.toActionsArray(input).then((list) => setActions(list));
  }, [input]);

  return actions;
}
