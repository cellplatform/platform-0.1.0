/**
 * https://github.com/suren-atoyan/monaco-react
 */

// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import React from 'react';
import MonacoEditor, { monaco } from '@monaco-editor/react';

try {
  // @ts-ignore
  console.log('Editor >> __CELL_ENV__:', __CELL_ENV__);
} catch (error) {
  console.error(error);
}

monaco.config({
  paths: {
    // vs: 'http://localhost:5000/cell:ckglm3anc000c8iet9e7nfgoo:A1/file/sample/web/vs',
    // vs: 'http://localhost:5000/cell:ckglm3anc000c8iet9e7nfgoo:A1/file/sample/web/vs',
    vs: 'https://dev.db.team/cell:ckgse6r8l000ccwethl0ubdrh:A1/file/sample/vs',

    // vs: 'vs',
  },
});

export const Editor: React.FC = () => {
  console.log('window.location', window.location);

  return <MonacoEditor language={'typescript'} />;
};

export default Editor;
