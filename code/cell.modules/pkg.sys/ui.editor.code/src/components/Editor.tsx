/**
 * https://github.com/suren-atoyan/monaco-react
 */
import MonacoEditorCore, { monaco } from '@monaco-editor/react';
import React from 'react';

import { bundle } from '../common';

// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

const toDir = (pathname: string) => {
  const parts = pathname.trim().split('/');
  return parts.slice(0, parts.length - 1).join('/');
};

const vs = bundle.path(`${toDir(location.pathname)}/static/vs`);

console.group('🌳 editor');
console.log('bundle', bundle);
console.log('vs', vs);
console.groupEnd();

monaco.config({ paths: { vs } });

export const Editor: React.FC = () => {
  return <MonacoEditorCore language={'typescript'} />;
};

export default Editor;
