import { useEffect, useState } from 'react';
import { Format, t } from '../common';

/**
 * Wrangles a flexible input type into a list of [Actions] objects.
 */
export function useActionsPropertyInput(input?: t.ActionsSet) {
  const [total, setTotal] = useState<number>(0);
  const [items, setItems] = useState<t.Actions[]>([]);

  useEffect(() => {
    const actions = Format.toActionsArray(input);
    setTotal(actions.total);
    actions.load().then((items) => setItems(items));
  }, [input]);

  const isEmpty = total === 0;
  return { isEmpty, total, items };
}
