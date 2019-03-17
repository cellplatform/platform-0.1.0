import { ReactNode } from 'react';

export type IStackPanel = {
  el: ReactNode;
  offsetOpacity?: number;
};

/**
 * [EVENTS]
 */
export type StackPanelSlideEvent = {
  stage: 'START' | 'COMPLETE';
  from: number;
  to: number;
};
export type StackPanelSlideEventHandler = (e: StackPanelSlideEvent) => void;
