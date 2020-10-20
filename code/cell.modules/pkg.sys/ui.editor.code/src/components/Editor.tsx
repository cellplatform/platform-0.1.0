/**
 * https://github.com/suren-atoyan/monaco-react
 */

import React from 'react';
import MonacoEditor from '@monaco-editor/react';

export const Editor: React.FC = () => {
  return <MonacoEditor height={'90vh'} language={'typescript'} />;
};
