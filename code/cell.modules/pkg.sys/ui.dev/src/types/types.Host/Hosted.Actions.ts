import { t } from '../common';

type StringOrNumber = string | number;

/**
 * Properties for the actions panel when hosted within the <Harness>
 */
export type HostedActions = {
  background?: StringOrNumber;
  border?: StringOrNumber | [StringOrNumber, number]; // Array: [color, width]
  edge?: t.HostedActionsEdge;
  width?: number;
};

export type HostedActionsEdge = 'left' | 'right';
