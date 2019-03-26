import {
  TextInputChangeEvent,
  TextInputTabEvent,
} from '@platform/ui.text/lib/components/TextInput';

export type FormulaInputChange = TextInputChangeEvent;
export type FormulaInputTab = TextInputTabEvent & { isCancelled: boolean };

/**
 * [Events]
 */
export type FormulaInputEvent =
  | IFormulaInputChangeEvent
  | IFormulaInputTabEvent
  | IFormulaInputFocusEvent
  | ICodeMirrorFormulaBlurEvent;

export type IFormulaInputChangeEvent = {
  type: 'INPUT/formula/change';
  payload: FormulaInputChange;
};

export type IFormulaInputTabEvent = {
  type: 'INPUT/formula/tab';
  payload: FormulaInputTab;
};

export type IFormulaInputFocusEvent = {
  type: 'INPUT/formula/focus';
  payload: {};
};
export type ICodeMirrorFormulaBlurEvent = {
  type: 'INPUT/formula/blur';
  payload: {};
};
