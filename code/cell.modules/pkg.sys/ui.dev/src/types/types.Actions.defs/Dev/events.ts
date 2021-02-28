import { t } from '../../common';

export type DevActionEvent =
  | t.IActionButtonEvent
  | t.IActionBooleanEvent
  | t.IActionSelectEvent
  | t.IActionTextboxEvent;
