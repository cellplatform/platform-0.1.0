import {
  TextInputChangeEvent,
  TextInputTabEvent,
} from '@platform/ui.text/lib/components/TextInput';

export type IModifierKeys = {
  alt: boolean;
  control: boolean;
  shift: boolean;
  meta: boolean;
};

export type FormulaInputChange = TextInputChangeEvent & { modifierKeys: IModifierKeys };
export type FormulaInputTab = TextInputTabEvent & {
  isCancelled: boolean;
  modifierKeys: IModifierKeys;
};

/**
 * [Events]
 */
export type FormulaInputEvent =
  | IFormulaInputChangeEvent
  | IFormulaInputTabEvent
  | IFormulaInputFocusEvent
  | ICodeMirrorFormulaBlurEvent
  | IFormulaInputNewLineEvent;

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

export type IFormulaInputNewLineEvent = {
  type: 'INPUT/formula/newLine';
  payload: IFormulaInputNewLine;
};
export type IFormulaInputNewLine = {
  isCancelled: boolean;
  cancel(): void;
  modifierKeys: IModifierKeys;
};
