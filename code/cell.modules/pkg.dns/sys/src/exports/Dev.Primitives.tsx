import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  useDragTarget: import('sys.ui.primitives/lib/hooks/useDragTarget/dev/DEV'),

  Antechamber: import('sys.ui.primitives/lib/ui/Antechamber/dev/DEV'),
  DotTabstrip: import('sys.ui.primitives/lib/ui/DotTabstrip/dev/DEV'),
  Zoom: import('sys.ui.primitives/lib/ui/Zoom/DEV'),
  PropList: import('sys.ui.primitives/lib/ui/PropList/dev/DEV'),
  QRCode: import('sys.ui.primitives/lib/ui/QRCode/dev/DEV'),
  TextEditor: import('sys.ui.primitives/lib/ui/TextEditor/DEV'),

  MinSize: import('sys.ui.primitives/lib/ui/MinSize/dev/DEV'),
  PositioningContainer: import('sys.ui.primitives/lib/ui/PositioningContainer/dev/DEV'),
  PositioningLayers: import('sys.ui.primitives/lib/ui/PositioningLayers/dev/DEV'),

  DraggableSort: import('sys.ui.primitives/lib/ui/Draggable.Sort/dev/DEV'),
  DraggableMotion: import('sys.ui.primitives/lib/ui/Draggable.Motion/dev/DEV'),

  Card: import('sys.ui.primitives/lib/ui/Card/dev/DEV'),
  CardStack: import('sys.ui.primitives/lib/ui/CardStack/dev/DEV'),

  EventCard: import('sys.ui.primitives/lib/ui/Event.Card/DEV'),
  EventStack: import('sys.ui.primitives/lib/ui/Event.Stack/DEV'),
  EventPipe: import('sys.ui.primitives/lib/ui/Event.Pipe/DEV'),

  Button: import('sys.ui.primitives/lib/ui.ref/button/Button.dev/DEV'),
  Switch: import('sys.ui.primitives/lib/ui.ref/button/Switch.dev/DEV'),
  OptionButtons: import('sys.ui.dev/lib/ui/OptionButtons/DEV'),

  // Svg: import('sys.ui.primitives/lib/ui/Image.Svg/dev/DEV'),

  Tree: import('sys.ui.primitives/lib/ui/Tree/dev/DEV'),
  StackPanel: import('sys.ui.primitives/lib/ui/StackPanel/dev/DEV'),
};

const dev = new URL(location.href).searchParams.get('dev');

const DevHarness: React.FC = () => <Harness actions={Object.values(imports)} initial={dev} />;
export default DevHarness;
// import { DevHarness } from 'sys.ui.primitives/lib/Dev.Harness';
// export default DevHarness;
