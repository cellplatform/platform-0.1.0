import { t } from '../common';

/**
 * Display properties of a <Host>.
 */
export type Host = {
  color?: number | string;
  background?: number | string;
  orientation?: t.Orientation;
  spacing?: number; // X or Y spacing between elements if more than one element is being rendered.
};
