import React from 'react';
import { Harness } from 'sys.ui.dev';
import { t } from './common';

const imports = {
  List: import('./ui/List/dev/DEV'),
  ListConnectorLines: import('./ui/List/dev/DEV.ConnectorLines'),
  Bullet: import('./ui/Bullet/dev/DEV'),

  Keyboard: import('./keyboard/dev/DEV'),

  Antechamber: import('./ui/Antechamber/dev/DEV'),
  DotTabstrip: import('./ui/DotTabstrip/dev/DEV'),
  Zoom: import('./ui/Zoom/DEV'),
  PropList: import('./ui/PropList/dev/DEV'),
  QRCode: import('./ui/QRCode/dev/DEV'),
  Semver: import('./ui/Semver/dev/DEV'),

  CmdTextbox: import('./ui/Cmd.Textbox/dev/DEV'),
  CmdBar: import('./ui/Cmd.Bar/dev/DEV'),
  CmdCard: import('./ui/Cmd.Card/dev/DEV'),

  LoadMask: import('./ui/LoadMask/dev/DEV'),

  ErrorBoundary: import('./ui/Error.Boundary/dev/DEV'),

  MinSize: import('./ui/MinSize/dev/DEV'),
  PositioningLayer: import('./ui/PositioningLayer/dev/DEV'),
  PositioningLayout: import('./ui/PositioningLayout/dev/DEV'),
  Photo: import('./ui/Photo/dev/DEV'),
  Font: import('./ui/Font/dev/DEV'),

  DraggableSort: import('./ui/Draggable.Sort/dev/DEV'),
  DraggableMotion: import('./ui/Draggable.Motion/dev/DEV'),

  Card: import('./ui/Card/dev/DEV'),
  CardStack: import('./ui/CardStack/dev/DEV'),

  EventCard: import('./ui/Event.Card/dev/DEV'),
  EventStack: import('./ui/Event.Stack/dev/DEV'),
  EventPipe: import('./ui/Event.Pipe/dev/DEV'),
  EventList: import('./ui/Event.List/dev/DEV'),

  FullScreen: import('./ui/Fullscreen/dev/DEV'),

  Chip: import('./ui/Chip/dev/DEV.Chip'),
  HashChip: import('./ui/Chip/dev/DEV.HashChip'),

  Button: import('./ui.ref/button/Button.dev/DEV'),
  Switch: import('./ui.ref/button/Switch.dev/DEV'),
  OptionButtons: import('sys.ui.dev/lib/ui/OptionButtons/dev/DEV'),

  Svg: import('./ui/Image.Svg/dev/DEV'),

  Tree: import('./ui/Tree/dev/DEV'),
  StackPanel: import('./ui/StackPanel/dev/DEV'),

  Text: import('./ui/Text/dev/DEV'),
  TextCopy: import('./ui/Text.Copy/dev/DEV'),
  TextSyntax: import('./ui/Text.Syntax/dev/DEV'),
  TextSecret: import('./ui/Text.Secret/dev/DEV'),
  TextInput: import('./ui/Text.Input/dev/DEV'),

  /**
   * Hooks
   */
  hookDragTarget: import('./hooks/DragTarget/dev/DEV'),
  hookUIEvents: import('./hooks/UIEvent/dev/DEV'),
  hookResizeObserver: import('./hooks/ResizeObserver/dev/DEV'),

  /**
   * Tests
   */
  UnitTests: import('./Dev.UnitTests'),
};

/**
 * UI Harness (Dev)
 */
type Props = { bus?: t.EventBus };

export const DevHarness: React.FC<Props> = (props) => {
  return <Harness bus={props.bus} actions={Object.values(imports)} showActions={true} />;
};

export default DevHarness;
