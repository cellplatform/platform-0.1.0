import { ReactNode } from 'react';

export type StackPanel = {
  el: ReactNode;
  offsetOpacity?: number;
};

/**
 * [Events]
 */

export type StackPanelSlideEvent = {
  stage: 'start' | 'complete';
  from: number;
  to: number;
};
export type StackPanelSlideEventHandler = (e: StackPanelSlideEvent) => void;
