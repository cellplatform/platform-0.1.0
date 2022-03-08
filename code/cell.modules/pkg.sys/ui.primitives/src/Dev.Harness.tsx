import React from 'react';
import { Harness } from 'sys.ui.dev';
import { t } from './common';

const imports = {
  useDragTarget: import('./hooks/DragTarget/dev/DEV'),
  useUIEvents: import('./hooks/UIEvents/dev/DEV'),

  Bullet: import('./ui/Bullet/dev/DEV'),
  List: import('./ui/List/dev/DEV'),
  ListConnectorLines: import('./ui/List/renderers/dev/DEV.ConnectorLines'),

  Antechamber: import('./ui/Antechamber/dev/DEV'),
  DotTabstrip: import('./ui/DotTabstrip/dev/DEV'),
  Zoom: import('./ui/Zoom/DEV'),
  PropList: import('./ui/PropList/dev/DEV'),
  QRCode: import('./ui/QRCode/dev/DEV'),
  TextEditor: import('./ui/TextEditor/DEV'),

  CommandTextbox: import('./ui/Command.Textbox/dev/DEV'),
  CommandBar: import('./ui/Command.Bar/dev/DEV'),
  CommandCard: import('./ui/Command.Card/dev/DEV'),

  MinSize: import('./ui/MinSize/dev/DEV'),
  PositioningLayer: import('./ui/PositioningLayer/dev/DEV'),
  PositioningLayout: import('./ui/PositioningLayout/dev/DEV'),

  DraggableSort: import('./ui/Draggable.Sort/dev/DEV'),
  DraggableMotion: import('./ui/Draggable.Motion/dev/DEV'),

  Card: import('./ui/Card/dev/DEV'),
  CardStack: import('./ui/CardStack/dev/DEV'),

  EventCard: import('./ui/Event.Card/dev/DEV'),
  EventStack: import('./ui/Event.Stack/dev/DEV'),
  EventPipe: import('./ui/Event.Pipe/dev/DEV'),
  EventList: import('./ui/Event.List/dev/DEV'),

  HashChip: import('./ui/HashChip/dev/DEV'),

  Button: import('./ui.ref/button/Button.dev/DEV'),
  Switch: import('./ui.ref/button/Switch.dev/DEV'),
  OptionButtons: import('sys.ui.dev/lib/web.ui/OptionButtons/dev/DEV'),

  Svg: import('./ui/Image.Svg/dev/DEV'),

  Tree: import('./ui/Tree/dev/DEV'),
  StackPanel: import('./ui/StackPanel/dev/DEV'),

  TextCopy: import('./ui/Text.Copy/dev/DEV'),
  TextSyntax: import('./ui/Text.Syntax/dev/DEV'),

  UnitTests: import('./ui.dev/DEV.UnitTests'),
};

/**
 * UI Harness (Dev)
 */
type Props = { bus?: t.EventBus };

export const DevHarness: React.FC<Props> = (props) => {
  return <Harness bus={props.bus} actions={Object.values(imports)} showActions={true} />;
};

export default DevHarness;
