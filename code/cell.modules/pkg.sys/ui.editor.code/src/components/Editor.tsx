/**
 * https://github.com/suren-atoyan/monaco-react
 */

// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import React from 'react';
import MonacoEditor, { monaco } from '@monaco-editor/react';

monaco.config({
  paths: {
    vs: 'http://localhost:3004/vs',
  },
});

export const Editor: React.FC = () => {
  return <MonacoEditor height={'90vh'} language={'typescript'} />;
};
