import React from 'react';
import { Harness } from 'sys.ui.dev';
import { t } from './common';

const imports = {
  Sample: import('./ui/DEV.Sample/dev/DEV'),
  SampleDeploy: import('./ui/DEV.Sample.Deploy/DEV'),

  Design: import('./ui/Design/DEV'),
  ModuleInfo: import('./ui/ModuleInfo/dev/DEV'),

  DocLayout: import('./ui/Doc.Layout/dev/DEV'),
  DocLayoutContainer: import('./ui/Doc.LayoutContainer/dev/DEV'),
  DocList: import('./ui/Doc.List/dev/DEV'),
  DocIndex: import('./ui/Doc.Index/dev/DEV'),
  DocHeadline: import('./ui/Doc.Headline/dev/DEV'),
  DocQuote: import('./ui/Doc.Quote/dev/DEV'),
  DocIdentity: import('./ui/Doc.Identity/dev/DEV'),

  DocBlocks: import('./ui/Doc.Blocks/dev/DEV'),
  DocBlockByline: import('./ui/Doc.Block.Byline/dev/DEV'),
  DocBlockMarkdown: import('./ui/Doc.Block.Markdown/dev/DEV'),
  DocBlockInsetPanel: import('./ui/Doc.Block.InsetPanel/dev/DEV'),
  DocBlockImage: import('./ui/Doc.Block.Image/dev/DEV'),

  TalkingDiagram: import('./ui/Diagram.TalkingDiagram/dev/DEV'),

  SysFont: import('./ui/Font/dev/DEV'),
  SysRouteBus: import('./ui/Route.Bus/dev/DEV'),
  SysRouteView: import('./ui/Route.View/dev/DEV'),

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
