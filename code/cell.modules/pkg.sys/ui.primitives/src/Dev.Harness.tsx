import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  useDragTarget: import('./hooks/useDragTarget/DEV'),
  DotTabstrip: import('./components/DotTabstrip/DEV'),
  Zoom: import('./components/Zoom/DEV'),
  Card: import('./components/Card/DEV'),
  PropList: import('./components/PropList/DEV'),
  TextEditor: import('./components/TextEditor/DEV'),
  OptionButtons: import('./components/OptionButtons/DEV'),

  Button: import('@platform/ui.button/lib/components/Button/DEV'),
  Switch: import('@platform/ui.button/lib/components/Switch/DEV'),
};

export const ACTIONS = Object.values(imports);
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
