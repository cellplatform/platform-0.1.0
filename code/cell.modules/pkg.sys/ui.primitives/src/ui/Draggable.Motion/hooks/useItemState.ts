import { MotionValue, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';

import { t } from '../common';
import * as n from '../types';
import { ItemUtil } from '../util';

/**
 * Manages spinning up a state object for an item.
 * scale state, accordingly.
 */
export function useItemState(args: { bus: t.EventBus<any>; def: n.MotionDraggableDef }) {
  const { bus } = args;
  const id = args.def.id;

  const [state, setState] = useState<n.MotionDraggableItem>();

  const toNumber = ItemUtil.toNumber;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(toNumber(args.def.width));
  const height = useMotionValue(toNumber(args.def.height));
  const scale = useMotionValue(toNumber(1));

  useEffect(() => {
    setState(ItemUtil.toState({ bus, id, x, y, width, height, scale }));
  }, []); // eslint-disable-line

  return {
    state,
    motion: { x, y, width, height, scale },
  };
}
