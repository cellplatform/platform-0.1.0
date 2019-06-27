import { MouseEvent } from '@platform/react/lib/types';

export * from './components/Button/types';
export * from './components/Switch/types';

/**
 * [Events.Button]
 */
export type ButtonEvent = IButtonMouseEvent;

export type IButtonMouseEvent = {
  type: 'BUTTON/mouse';
  payload: IButtonMouse;
};
export type IButtonMouse = MouseEvent & { id: string };

/**
 * [Events.Switch]
 */
export type SwitchEvent = ISwitchMouseEvent | ISwitchChangeEvent;

export type ISwitchMouseEvent = {
  type: 'SWITCH/mouse';
  payload: IButtonMouse;
};
export type ISwitchMouse = MouseEvent & { id: string };

export type ISwitchChangeEvent = {
  type: 'SWITCH/change';
  payload: ISwitchChange;
};
export type ISwitchChange = { id: string; from: boolean; to: boolean };
