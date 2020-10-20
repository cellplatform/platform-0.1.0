// import '../MonacoEnvironment';

// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import React from 'react';
import * as monaco from 'monaco-editor';

// @ts-ignore
self.MonacoEnvironment = {
  getWorkerUrl: function (_moduleId: any, label: string) {
    console.log('label', label);

    const toFilename = (label: string) => {
      if (label === 'json') {
        return 'json.worker.js';
      }
      if (label === 'css') {
        return 'css.worker.js';
      }
      if (label === 'html') {
        return 'html.worker.js';
      }
      if (label === 'typescript' || label === 'javascript') {
        return 'ts.worker.js';
      }
      return 'editor.worker.js';
    };

    const base = 'http://localhost:3003';
    const url = `${base}/${toFilename(label)}`;

    console.log('MonacoEnvironment.getWorkerUrl: ', url);
    return url;
  },
};

export class CodeEditor extends React.PureComponent {
  private div!: HTMLDivElement;
  private divRef = (ref: HTMLDivElement) => (this.div = ref);

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const value = `
function x() {
  console.log("Hello world!");
;
`;

    console.log('monaco', monaco);

    monaco.editor.create(this.div, {
      value,
      language: 'typescript',
    });
  }

  /**
   * [Render]
   */
  public render() {
    const style = { width: 800, height: 600, border: `solid 1px ` };
    return <div ref={this.divRef} style={style} />;
  }
}
