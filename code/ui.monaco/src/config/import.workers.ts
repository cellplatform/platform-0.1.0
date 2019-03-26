/**
 * See:
 *    https://github.com/Microsoft/monaco-editor-samples/blob/master/browser-esm-parcel/src/index.js#L95
 */

(self as any).MonacoEnvironment = {
  getWorker(moduleId: string, label: string) {
    if (label === 'json') {
      return new Worker(
        '../../node_modules/monaco-editor/esm/vs/language/json/json.worker.js',
      );
    }
    if (label === 'css') {
      return new Worker(
        '../../node_modules/monaco-editor/esm/vs/language/css/css.worker.js',
      );
    }
    if (label === 'html') {
      return new Worker(
        '../../node_modules/monaco-editor/esm/vs/language/html/html.worker.js',
      );
    }
    if (label === 'typescript' || label === 'javascript') {
      return new Worker(
        '../../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js',
      );
    }
    return new Worker(
      '../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js',
    );
  },
};
