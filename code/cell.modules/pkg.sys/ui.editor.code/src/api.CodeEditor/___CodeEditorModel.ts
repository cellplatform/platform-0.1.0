import { t, StateObject, DEFAULT } from '../common';

export const CodeEditorModel = {
  /**
   * Create a new instance of the model.
   */
  create(initial?: t.CodeEditorModel) {
    // initial = initial || {text:'', filename: 'unnamed.ts', }

    return StateObject.create<t.CodeEditorModel>(initial || DEFAULT.MODEL);
  },
};
