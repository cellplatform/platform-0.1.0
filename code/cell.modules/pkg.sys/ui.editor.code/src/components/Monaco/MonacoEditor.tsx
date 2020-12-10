/**
 * https://github.com/suren-atoyan/monaco-react
 */
import MonacoEditorCore, { monaco } from '@monaco-editor/react';
import React, { useEffect } from 'react';

import { bundle, constants, Uri } from '../../common';
import { Monaco } from './Monaco';

const MONACO = constants.MONACO;

const toDir = (pathname: string) => {
  let parts = pathname.trim().split('/').filter(Boolean);
  console.log('parts', parts);
  // let dir= parts.slice(0, parts.length - 1).join('/');

  parts = parts.slice(0, parts.length - 1);

  if (Uri.is.uri(parts[0]) && parts[1] === 'file') {
    parts = parts.slice(2);
  } else if (Uri.is.uri(parts[0])) {
    parts = parts.slice(1);
  }

  console.log('Uri.is.uri(parts[0])', Uri.is.uri(parts[0]));

  let path = parts.join('/');

  path = bundle.dir ? path.substring(bundle.dir.length) : path;
  path = path.replace(/^\/*/, '');

  return path;
};

const vs = bundle.path(`${toDir(location.pathname)}/static/vs`);

console.log('__CELL__', __CELL__);
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
