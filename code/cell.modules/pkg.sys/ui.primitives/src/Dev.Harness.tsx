import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  useDragTarget: import('./hooks/useDragTarget/DEV'),

  DotTabstrip: import('./components/DotTabstrip/DEV'),
  Zoom: import('./components/Zoom/DEV'),
  Card: import('./components/Card/DEV'),
  CardStack: import('./components/CardStack/dev/DEV'),
  PropList: import('./components/PropList/dev/DEV'),
  TextEditor: import('./components/TextEditor/DEV'),

  Button: import('./components.ref/button/Button.dev/DEV'),
  Switch: import('./components.ref/button/Switch.dev/DEV'),
  OptionButtons: import('sys.ui.dev/lib/components/OptionButtons/DEV'),
};

export const ACTIONS = Object.values(imports);
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
