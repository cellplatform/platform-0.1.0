import { useEffect, useState } from 'react';
import { Format, t } from '../common';

/**
 * Wrangles a flexible input type into a list of [Actions] objects.
 */
export function useActionsPropertyInput(input?: t.ActionsSet) {
  const [isEmpty, setEmpty] = useState<boolean | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [items, setItems] = useState<t.Actions[]>([]);

  useEffect(() => {
    const actions = Format.toActionsArray(input);
    setTotal(actions.total);
    setEmpty(actions.total === 0);
    actions.load().then((items) => setItems(items));
  }, [input]);

  return { isEmpty, total, items };
}
