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

export type IFormulaInputTab = TextInputTabEvent & {
  isCancelled: boolean;
  modifierKeys: IModifierKeys;
};

/**
 * [Events]
 */
export type FormulaInputEvent =
  | IFormulaInputChangingEvent
  | IFormulaInputChangedEvent
  | IFormulaInputTabEvent
  | IFormulaInputFocusEvent
  | ICodeMirrorFormulaBlurEvent
  | IFormulaInputNewLineEvent;

export type IFormulaInputChangingEvent = {
  type: 'INPUT/formula/changing';
  payload: IFormulaInputChanged;
};
export type IFormulaInputChanging = IFormulaInputChanged & { cancel(): void; isCancelled: boolean };

export type IFormulaInputChangedEvent = {
  type: 'INPUT/formula/changed';
  payload: IFormulaInputChanged;
};
export type IFormulaInputChanged = TextInputChangeEvent & { modifierKeys: IModifierKeys };

export type IFormulaInputTabEvent = {
  type: 'INPUT/formula/tab';
  payload: IFormulaInputTab;
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
