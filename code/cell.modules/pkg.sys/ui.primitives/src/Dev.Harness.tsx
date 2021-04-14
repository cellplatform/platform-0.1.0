import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  useDragTarget: import('./hooks/useDragTarget/DEV'),

  DotTabstrip: import('./components/DotTabstrip/DEV'),
  Zoom: import('./components/Zoom/DEV'),
  PropList: import('./components/PropList/dev/DEV'),
  TextEditor: import('./components/TextEditor/DEV'),

  DraggableMotion: import('./components/Draggable.Motion/dev/DEV'),
  DraggableSort: import('./components/Draggable.Sort/dev/DEV'),

  Card: import('./components/Card/DEV'),
  CardStack: import('./components/CardStack/dev/DEV'),

  EventCard: import('./components/Event.Card/DEV'),
  EventStack: import('./components/Event.Stack/DEV'),
  EventPipe: import('./components/Event.Pipe/DEV'),

  Button: import('./components.ref/button/Button.dev/DEV'),
  Switch: import('./components.ref/button/Switch.dev/DEV'),
  OptionButtons: import('sys.ui.dev/lib/components/OptionButtons/DEV'),
};

export const ACTIONS = Object.values(imports);
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
