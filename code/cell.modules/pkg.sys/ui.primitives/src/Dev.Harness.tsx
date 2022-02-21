import React from 'react';
import { Harness } from 'sys.ui.dev';
import { t } from './common';

const imports = {
  useDragTarget: import('./hooks/useDragTarget/dev/DEV'),

  Antechamber: import('./ui/Antechamber/dev/DEV'),
  BulletListLayout: import('./ui/BulletList.Layout/dev/DEV'),
  DotTabstrip: import('./ui/DotTabstrip/dev/DEV'),
  Zoom: import('./ui/Zoom/DEV'),
  PropList: import('./ui/PropList/dev/DEV'),
  QRCode: import('./ui/QRCode/dev/DEV'),
  TextEditor: import('./ui/TextEditor/DEV'),

  CommandTextbox: import('./ui/Command.Textbox/dev/DEV'),
  CommandBar: import('./ui/Command.Bar/dev/DEV'),

  MinSize: import('./ui/MinSize/dev/DEV'),
  PositioningContainer: import('./ui/PositioningContainer/dev/DEV'),
  PositioningLayers: import('./ui/PositioningLayers/dev/DEV'),

  DraggableSort: import('./ui/Draggable.Sort/dev/DEV'),
  DraggableMotion: import('./ui/Draggable.Motion/dev/DEV'),

  Card: import('./ui/Card/dev/DEV'),
  CardStack: import('./ui/CardStack/dev/DEV'),

  EventCard: import('./ui/Event.Card/dev/DEV'),
  EventStack: import('./ui/Event.Stack/dev/DEV'),
  EventPipe: import('./ui/Event.Pipe/dev/DEV'),

  HashChip: import('./ui/HashChip/dev/DEV'),

  Button: import('./ui.ref/button/Button.dev/DEV'),
  Switch: import('./ui.ref/button/Switch.dev/DEV'),
  OptionButtons: import('sys.ui.dev/lib/web.ui/OptionButtons/DEV'),

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
  const url = new URL(location.href);
  return (
    <Harness
      bus={props.bus}
      actions={Object.values(imports)}
      initial={url.searchParams.get('dev')}
      showActions={true}
    />
  );
};

export default DevHarness;
