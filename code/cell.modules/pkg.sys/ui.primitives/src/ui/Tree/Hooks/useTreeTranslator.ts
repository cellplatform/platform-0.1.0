import React, { useEffect, useState } from 'react';

import { t } from '../common';

/**
 * Provides a state-model translator into shape of data consumed
 * by a <TreeView> component.
 */
export function useTreeTranslator(args: { bus: t.EventBus<any>; isEnabled?: boolean }) {
  const { bus, isEnabled } = args;

  const [root, setRoot] = useState<t.ITreeviewNode | undefined>();
  const [current, setCurrent] = useState<string | undefined>();

  useEffect(() => {
    //
    console.log('READY: useTreeTranslator');
    setRoot(SIMPLE);
    // return () => 123;
  }, [bus]);

  //
  return {
    isEnabled,
    root: isEnabled ? root : undefined,
    current: isEnabled ? current : undefined,
  };
}

/**
 * TODO 🐷
 * - translate between data-model and tree structure.
 */

export const SIMPLE: t.ITreeviewNode = {
  id: 'root',
  props: {
    treeview: {
      label: 'Sheet',
      icon: 'Face',
    },
  },
  children: [
    { id: 'child-1', props: { treeview: { icon: 'Face', marginTop: 30 } } },
    { id: 'child-2', props: { treeview: { icon: 'Face' } } },
    { id: 'child-3', props: { treeview: { icon: 'Face' } } },
    { id: 'child-4', props: { treeview: { icon: 'Face' } } },
    { id: 'child-5', props: { treeview: { icon: 'Face' } } },
  ],
};
