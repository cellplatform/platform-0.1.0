import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  useDragTarget: import('./hooks/useDragTarget/dev/DEV'),

  DotTabstrip: import('./ui/DotTabstrip/dev/DEV'),
  Zoom: import('./ui/Zoom/DEV'),
  PropList: import('./ui/PropList/dev/DEV'),
  QRCode: import('./ui/QRCode/dev/DEV'),
  TextEditor: import('./ui/TextEditor/DEV'),

  MinSize: import('./ui/MinSize/dev/DEV'),
  PositioningContainer: import('./ui/PositioningContainer/dev/DEV'),
  PositioningLayers: import('./ui/PositioningLayers/dev/DEV'),

  DraggableSort: import('./ui/Draggable.Sort/dev/DEV'),
  DraggableMotion: import('./ui/Draggable.Motion/dev/DEV'),

  Card: import('./ui/Card/dev/DEV'),
  CardStack: import('./ui/CardStack/dev/DEV'),

  EventCard: import('./ui/Event.Card/DEV'),
  EventStack: import('./ui/Event.Stack/DEV'),
  EventPipe: import('./ui/Event.Pipe/DEV'),

  Button: import('./ui.ref/button/Button.dev/DEV'),
  Switch: import('./ui.ref/button/Switch.dev/DEV'),
  OptionButtons: import('sys.ui.dev/lib/ui/OptionButtons/DEV'),

  Svg: import('./ui.image/Svg/dev/DEV'),

  Tree: import('./ui/Tree/dev/DEV'),
  StackPanel: import('./ui/StackPanel/dev/DEV'),
};

const ns = new URL(location.href).searchParams.get('ns');

export const DevHarness: React.FC = () => <Harness actions={Object.values(imports)} initial={ns} />;
