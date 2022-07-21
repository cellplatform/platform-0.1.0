import { t } from '../common';

export const CodeEditorAction = (
  editor: t.IMonacoStandaloneCodeEditor,
  id: t.MonacoAction,
): t.CodeEditorAction => {
  const action = editor.getAction(id);
  return {
    id: action?.id || '',
    alias: action?.alias || '',
    label: action?.label || '',
    exists: Boolean(action),
    get isSupported() {
      return action?.isSupported() || false;
    },
    async run() {
      if (!action) throw new Error(`The editor action '${id}' does not exist`);
      if (!action.isSupported()) throw new Error(`The editor action '${id}' is not supported.`);
      await action.run();
    },
  };
};
