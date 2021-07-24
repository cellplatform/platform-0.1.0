import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  useDragTarget: import('./hooks/useDragTarget/dev/DEV'),

  DotTabstrip: import('./components/DotTabstrip/DEV'),
  Zoom: import('./components/Zoom/DEV'),
  PropList: import('./components/PropList/dev/DEV'),
  QRCode: import('./components/QRCode/dev/DEV'),
  TextEditor: import('./components/TextEditor/DEV'),
  MinSize: import('./components/MinSize/dev/DEV'),

  DraggableSort: import('./components/Draggable.Sort/dev/DEV'),
  DraggableMotion: import('./components/Draggable.Motion/dev/DEV'),

  Card: import('./components/Card/DEV'),
  CardStack: import('./components/CardStack/dev/DEV'),

  EventCard: import('./components/Event.Card/DEV'),
  EventStack: import('./components/Event.Stack/DEV'),
  EventPipe: import('./components/Event.Pipe/DEV'),

  Button: import('./components.ref/button/Button.dev/DEV'),
  Switch: import('./components.ref/button/Switch.dev/DEV'),
  OptionButtons: import('sys.ui.dev/lib/components/OptionButtons/DEV'),

  Svg: import('./ui.image/Svg/dev/DEV'),

  Tree: import('./components.ref/tree/Tree.dev/DEV'),
};

const ns = new URL(location.href).searchParams.get('ns');

export const DevHarness: React.FC = () => <Harness actions={Object.values(imports)} initial={ns} />;
