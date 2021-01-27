import { t } from '../common';

/**
 * Display properties of a <Host>.
 */
export type IDevHost = {
  background?: number | string;
  orientation?: t.DevOrientation;
  spacing?: number; // X or Y spacing between elements if more than one element is being rendered.
};
