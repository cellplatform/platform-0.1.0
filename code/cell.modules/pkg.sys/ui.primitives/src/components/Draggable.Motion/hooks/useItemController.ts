import { useEffect } from 'react';

import { t } from '../common';
import { Controller } from '../Controller';
import * as n from '../types';
import { useItemState } from './useItemState';

/**
 * Monitors requests for an items current status.
 */
export function useItemController(args: { bus: t.EventBus<any>; def: n.MotionDraggableDef }) {
  const { def } = args;
  const bus = args.bus.type<n.MotionDraggableEvent>();
  const { state, motion } = useItemState({ bus, def });

  useEffect(() => {
    const controller = state ? Controller({ bus, state, motion }) : undefined;
    return () => controller?.dispose();
  }, [state?.id]); // eslint-disable-line

  return { state, motion };
}
