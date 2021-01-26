import { t } from '../common';

/**
 * INPUT: A button with a toggle switch (boolean)
 */
export type DevActionSelect = t.DevActionSelectProps & {
  id: string;
  kind: 'select';
  current?: any; // Latest value produced by the handler.
  handler?: t.DevActionSelectHandler<any>;
};

export type DevActionSelectProps = {
  label: string;
  description?: string;
  items: DevActionSelectItem[];
};

export type DevActionSelectItem<V = any> = { label: string; value: V };
