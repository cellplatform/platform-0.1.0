/**
 * https://github.com/suren-atoyan/monaco-react
 */
import MonacoEditorCore, { monaco } from '@monaco-editor/react';
import React, { useEffect } from 'react';

import { bundle, constants } from '../../common';
import { Monaco } from './Monaco';

const MONACO = constants.MONACO;

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

/**
 * Vanilla [Monaco] editor
 */
export const MonacoEditor: React.FC = () => {
  useEffect(() => {
    console.log('use');
    // Ensure the (singleton) API is initialized and configured.

    Monaco.singleton();

    return () => {
      // Cleanup.
    };
  });

  console.log('1');
  return <MonacoEditorCore language={MONACO.LANGUAGE.TS} theme={MONACO.THEME} options={{}} />;
};

export default MonacoEditor;
