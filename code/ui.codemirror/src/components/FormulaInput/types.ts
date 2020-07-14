import {
  TextInputChangeEvent,
  TextInputTabEvent,
  ITextModifierKeys,
} from '@platform/ui.text/lib/types';

export { ITextModifierKeys };
export type IFormulaInputTab = TextInputTabEvent & { isCancelled: boolean };

/**
 * [Events]
 */
export type FormulaInputEvent =
  | IFormulaInputChangingEvent
  | IFormulaInputChangedEvent
  | IFormulaInputTabEvent
  | IFormulaInputFocusEvent
  | ICodeMirrorFormulaBlurEvent
  | IFormulaInputEnterEvent;

export type IFormulaInputChangingEvent = {
  type: 'INPUT/formula/changing';
  payload: IFormulaInputChanged;
};
export type IFormulaInputChanging = IFormulaInputChanged & { cancel(): void; isCancelled: boolean };

export type IFormulaInputChangedEvent = {
  type: 'INPUT/formula/changed';
  payload: IFormulaInputChanged;
};
export type IFormulaInputChanged = TextInputChangeEvent;

export type IFormulaInputTabEvent = {
  type: 'INPUT/formula/tab';
  payload: IFormulaInputTab;
};

export type IFormulaInputFocusEvent = {
  type: 'INPUT/formula/focus';
  payload: { focus: true };
};
export type ICodeMirrorFormulaBlurEvent = {
  type: 'INPUT/formula/blur';
  payload: { focus: false };
};

export type IFormulaInputEnterEvent = {
  type: 'INPUT/formula/enter';
  payload: IFormulaInputEnter;
};
export type IFormulaInputEnter = {
  modifierKeys: ITextModifierKeys;
  isCancelled: boolean;
  cancel(): void;
};
